<?php

namespace _Helpers;

use InvalidArgumentException;
use PDOException;

// require 'src/PHPMailer/src/PHPMailer.php';
// require 'src/PHPMailer/src/Exception.php';
// require 'src/PHPMailer/src/SMTP.php';
// require 'vendor/autoload.php';

// use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\Exception;
use \PDO;

class SQLDB
{
	private $pdo;

	public function __construct($pdo)
	{
		$this->pdo = $pdo;
	}

	public function insert($table, $data)
	{
		// Generate placeholders for the prepared statement
		$columns = implode(", ", array_keys($data));
		$placeholders = ":" . implode(", :", array_keys($data));

		// Prepare the SQL statement
		$sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
		$stmt = $this->pdo->prepare($sql);

		// Bind the parameters dynamically
		foreach ($data as $key => $value) {
			$stmt->bindValue(":$key", $value);
		}

		// Execute the statement
		return $stmt->execute();
	}
	// READ
	public function select($table, $columns = ['*'], $conditions = [])
	{
		// Start the query
		$query = "SELECT " . implode(", ", $columns) . " FROM $table";

		// Add conditions if provided
		if (!empty($conditions)) {
			$query .= " WHERE " . implode(" AND ", array_map(function ($key) {
				return strpos($key, ' ') !== false ? $key : "$key = :$key"; // Handle raw conditions
			}, array_keys($conditions)));
		}

		// Prepare and execute the query
		$stmt = $this->pdo->prepare($query);

		if (!empty($conditions)) {
			foreach ($conditions as $key => $value) {
				if (strpos($key, ' ') === false) { // Skip raw conditions
					$stmt->bindValue(":$key", $value);
				}
			}
		}

		$stmt->execute();

		// Fetch the results
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}
	public function selectWithJoin($table, $conditions = [], $columns = ['*'], $joins = [], $operator = 'AND', $orConditions = [])
	{
		// Validate the operator (only allow AND or OR)
		$operator = strtoupper($operator);
		if (!in_array($operator, ['AND', 'OR'])) {
			throw new InvalidArgumentException("Invalid operator. Use 'AND' or 'OR'.");
		}

		// Start the query
		$query = "SELECT " . implode(", ", $columns) . " FROM $table";

		// Add joins if provided, support 'type' (LEFT, INNER, etc.)
		foreach ($joins as $join) {
			$type = isset($join['type']) ? strtoupper($join['type']) : 'INNER'; // Default to INNER JOIN if not specified
			// Only allow valid join types
			$allowedTypes = ['INNER', 'LEFT', 'RIGHT', 'FULL OUTER', 'LEFT OUTER', 'RIGHT OUTER'];
			if (!in_array($type, $allowedTypes)) {
				$type = 'INNER';
			}
			$query .= " $type JOIN {$join['table']} AS {$join['alias']} ON {$join['on']}";
		}

		// Prepare conditions and parameters
		$sanitizedConditions = [];
		$andConditions = [];
		$orConditionsQuery = [];

		// Process AND conditions
		foreach ($conditions as $key => $value) {
			if (is_array($value)) {
				// Handle IN() conditions
				$placeholders = implode(',', array_fill(0, count($value), '?'));
				$andConditions[] = "$key IN ($placeholders)";
				$sanitizedConditions = array_merge($sanitizedConditions, $value);
			} elseif (strpos($key, '_condition') !== false) {
				// Raw condition (like availability_status_condition)
				$andConditions[] = $value;
			} else {
				$placeholder = str_replace('.', '_', $key);
				$andConditions[] = "$key = ?";
				$sanitizedConditions[] = $value;
			}
		}

		// Process OR conditions for LIKE
		if (!empty($orConditions)) {
			foreach ($orConditions as $condition) {
				$column = key($condition);
				$value = current($condition);
				$orConditionsQuery[] = "$column LIKE ?";
				$sanitizedConditions[] = $value;
			}
		}

		// Combine AND and OR conditions
		$whereClause = implode(" $operator ", $andConditions);
		if (!empty($orConditionsQuery)) {
			$whereClause .= (!empty($whereClause) ? " $operator " : "") . "(" . implode(" OR ", $orConditionsQuery) . ")";
		}

		if (!empty($whereClause)) {
			$query .= " WHERE $whereClause";
		}

		// Prepare and execute the query
		$stmt = $this->pdo->prepare($query);
		$stmt->execute($sanitizedConditions);

		// Fetch the results
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	public function deleteWithConditions($table, $conditions = [])
	{
		// Start the query
		$query = "DELETE FROM $table";

		// Add conditions if provided
		if (!empty($conditions)) {
			$query .= " WHERE " . implode(" AND ", array_map(function ($key) {
				$placeholder = str_replace('.', '_', $key); // Replace dots with underscores
				return "$key = :$placeholder";
			}, array_keys($conditions)));

			// Sanitize condition keys
			$sanitizedConditions = [];
			foreach ($conditions as $key => $value) {
				$sanitizedKey = str_replace('.', '_', $key);
				$sanitizedConditions[$sanitizedKey] = $value;
			}
		} else {
			// If no conditions are provided, prevent deleting all records
			throw new Exception("Delete operation requires conditions to avoid deleting all records.");
		}

		// Prepare and execute the query
		$stmt = $this->pdo->prepare($query);
		$stmt->execute($sanitizedConditions);

		// Return the number of affected rows
		return $stmt->rowCount();
	}



	// UPDATE
	public function update($table, $data, $conditions)
	{
		$setClauses = [];
		foreach ($data as $key => $value) {
			if (is_array($value) && isset($value['raw'])) {
				// Handle raw SQL expressions
				$setClauses[] = "$key = {$value['raw']}";
			} else {
				$setClauses[] = "$key = :$key";
			}
		}

		$conditionClauses = [];
		foreach ($conditions as $key => $value) {
			$conditionClauses[] = "$key = :cond_$key";
		}

		$sql = "UPDATE $table SET " . implode(", ", $setClauses) . " WHERE " . implode(" AND ", $conditionClauses);
		$stmt = $this->pdo->prepare($sql);

		foreach ($data as $key => $value) {
			if (!(is_array($value) && isset($value['raw']))) {
				$stmt->bindValue(":$key", $value);
			}
		}

		foreach ($conditions as $key => $value) {
			$stmt->bindValue(":cond_$key", $value);
		}

		return $stmt->execute();
	}

	// DELETE
	public function delete($table, $conditions)
	{
		$conditionClauses = [];
		foreach ($conditions as $key => $value) {
			$conditionClauses[] = "$key = :$key";
		}

		$sql = "DELETE FROM $table WHERE " . implode(" AND ", $conditionClauses);
		$stmt = $this->pdo->prepare($sql);

		foreach ($conditions as $key => $value) {
			$stmt->bindValue(":$key", $value);
		}

		return $stmt->execute();
	}

	public function countTableRows($tableName, $whereClause = '', $params = [])
	{
		try {
			// Start building the SQL query
			$query = "SELECT COUNT(*) AS total FROM `$tableName`";

			// Append WHERE clause if provided
			if (!empty($whereClause)) {
				$query .= " WHERE $whereClause";
			}

			// Prepare the query
			$stmt = $this->pdo->prepare($query);

			// Execute the query with parameters
			$stmt->execute($params);

			// Fetch the result
			$result = $stmt->fetch(PDO::FETCH_ASSOC);

			// Return the count
			return $result['total'] ?? 0;
		} catch (PDOException $e) {
			// Handle errors
			error_log("Error counting rows in table `$tableName`: " . $e->getMessage());
			return false;
		}
	}

	public function validateRequiredPostFields(array $requiredFields, array $data)
	{
		$missing = [];
		foreach ($requiredFields as $field) {
			if (!isset($data[$field]) || $data[$field] === '') {
				$missing[] = $field;
			}
		}
		return empty($missing) ? true : $missing;
	}
}
/**
 * Secure and Fast PHP QueryBuilder
 * Features: Method chaining, prepared statements, SQL injection protection
 */
class QueryBuilder
{
	private $pdo;
	private $table;
	private $select = ['*'];
	private $joins = [];
	private $where = [];
	private $orderBy = [];
	private $groupBy = [];
	private $having = [];
	private $limit;
	private $offset;
	private $bindings = [];
	private $bindingCounter = 0;

	public function __construct(PDO $pdo)
	{
		$this->pdo = $pdo;
		$this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}

	/**
	 * Set the table for the query
	 */
	public function table(string $table): self
	{
		$this->table = $this->escapeIdentifier($table);
		return $this;
	}

	/**
	 * Set SELECT columns, supporting AS aliases
	 */
	public function select($columns = ['*']): self
	{
		if (is_string($columns)) {
			$columns = [$columns];
		}

		$this->select = array_map(function ($col) {
			// Handle AS aliases
			if (stripos($col, ' AS ') !== false) {
				list($identifier, $alias) = explode(' AS ', $col, 2);
				return $this->escapeIdentifier(trim($identifier)) . ' AS ' . $this->escapeIdentifier(trim($alias));
			}
			return $this->escapeIdentifier($col);
		}, $columns);

		return $this;
	}

	/**
	 * Add WHERE clause
	 */
	public function where(string $column, string $operator, $value): self
	{
		$placeholder = $this->getPlaceholder();
		$this->where[] = $this->escapeIdentifier($column) . ' ' . $this->sanitizeOperator($operator) . ' ' . $placeholder;
		$this->bindings[$placeholder] = $value;
		return $this;
	}

	/**
	 * Add OR WHERE clause
	 */
	public function orWhere(string $column, string $operator, $value): self
	{
		$placeholder = $this->getPlaceholder();
		$connector = empty($this->where) ? '' : ' OR ';
		$this->where[] = $connector . $this->escapeIdentifier($column) . ' ' . $this->sanitizeOperator($operator) . ' ' . $placeholder;
		$this->bindings[$placeholder] = $value;
		return $this;
	}

	/**
	 * Add WHERE IN clause
	 */
	public function whereIn(string $column, array $values): self
	{
		$placeholders = [];
		foreach ($values as $value) {
			$placeholder = $this->getPlaceholder();
			$placeholders[] = $placeholder;
			$this->bindings[$placeholder] = $value;
		}

		$this->where[] = $this->escapeIdentifier($column) . ' IN (' . implode(', ', $placeholders) . ')';
		return $this;
	}

	/**
	 * Add WHERE BETWEEN clause
	 */
	public function whereBetween(string $column, $start, $end): self
	{
		$startPlaceholder = $this->getPlaceholder();
		$endPlaceholder = $this->getPlaceholder();

		$this->where[] = $this->escapeIdentifier($column) . ' BETWEEN ' . $startPlaceholder . ' AND ' . $endPlaceholder;
		$this->bindings[$startPlaceholder] = $start;
		$this->bindings[$endPlaceholder] = $end;

		return $this;
	}

	/**
	 * Add WHERE LIKE clause
	 */
	public function whereLike(string $column, string $pattern): self
	{
		$placeholder = $this->getPlaceholder();
		$this->where[] = $this->escapeIdentifier($column) . ' LIKE ' . $placeholder;
		$this->bindings[$placeholder] = $pattern;
		return $this;
	}

	/**
	 * Add WHERE NULL clause
	 */
	public function whereNull(string $column): self
	{
		$this->where[] = $this->escapeIdentifier($column) . ' IS NULL';
		return $this;
	}

	/**
	 * Add WHERE NOT NULL clause
	 */
	public function whereNotNull(string $column): self
	{
		$this->where[] = $this->escapeIdentifier($column) . ' IS NOT NULL';
		return $this;
	}

	/**
	 * Add INNER JOIN
	 */
	public function join(string $table, string $first, string $operator, string $second): self
	{
		$this->joins[] = 'INNER JOIN ' . $this->escapeIdentifier($table) . ' ON ' .
			$this->escapeIdentifier($first) . ' ' . $this->sanitizeOperator($operator) . ' ' .
			$this->escapeIdentifier($second);
		return $this;
	}

	/**
	 * Add LEFT JOIN
	 */
	// public function leftJoin(string $table, string $first, string $operator, string $second): self
	// {
	// 	$this->joins[] = 'LEFT JOIN ' . $this->escapeIdentifier($table) . ' ON ' .
	// 		$this->escapeIdentifier($first) . ' ' . $this->sanitizeOperator($operator) . ' ' .
	// 		$this->escapeIdentifier($second);
	// 	return $this;
	// }
	public function leftJoin(string $table, string $first, string $operator, string $second, string $alias = null): self
	{
		$tablePart = $this->escapeIdentifier($table);
		if ($alias) {
			$tablePart .= ' AS ' . $this->escapeIdentifier($alias);
		}

		$this->joins[] = 'LEFT JOIN ' . $tablePart . ' ON ' .
			$this->escapeIdentifier($first) . ' ' . $this->sanitizeOperator($operator) . ' ' .
			$this->escapeIdentifier($second);
		return $this;
	}

	/**
	 * Add RIGHT JOIN
	 */
	public function rightJoin(string $table, string $first, string $operator, string $second): self
	{
		$this->joins[] = 'RIGHT JOIN ' . $this->escapeIdentifier($table) . ' ON ' .
			$this->escapeIdentifier($first) . ' ' . $this->sanitizeOperator($operator) . ' ' .
			$this->escapeIdentifier($second);
		return $this;
	}

	/**
	 * Add ORDER BY clause
	 */
	public function orderBy(string $column, string $direction = 'ASC'): self
	{
		$direction = strtoupper($direction);
		if (!in_array($direction, ['ASC', 'DESC'])) {
			$direction = 'ASC';
		}

		$this->orderBy[] = $this->escapeIdentifier($column) . ' ' . $direction;
		return $this;
	}

	/**
	 * Add GROUP BY clause
	 */
	public function groupBy(string $column): self
	{
		$this->groupBy[] = $this->escapeIdentifier($column);
		return $this;
	}

	/**
	 * Add HAVING clause
	 */
	public function having(string $column, string $operator, $value): self
	{
		$placeholder = $this->getPlaceholder();
		$this->having[] = $this->escapeIdentifier($column) . ' ' . $this->sanitizeOperator($operator) . ' ' . $placeholder;
		$this->bindings[$placeholder] = $value;
		return $this;
	}

	/**
	 * Add LIMIT clause
	 */
	public function limit(int $limit): self
	{
		$this->limit = $limit;
		return $this;
	}

	/**
	 * Add OFFSET clause
	 */
	public function offset(int $offset): self
	{
		$this->offset = $offset;
		return $this;
	}

	/**
	 * Execute SELECT query and return all results
	 */
	public function get(): array
	{
		$sql = $this->buildSelectQuery();
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute($this->bindings);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Execute SELECT query and return first result
	 */
	public function first(): ?array
	{
		$this->limit(1);
		$results = $this->get();
		return $results[0] ?? null;
	}

	/**
	 * Get count of records
	 */
	public function count(): int
	{
		$originalSelect = $this->select;
		$this->select = ['COUNT(*) as count'];

		$sql = $this->buildSelectQuery();
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute($this->bindings);
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		$this->select = $originalSelect;
		return (int) $result['count'];
	}
	/**
	 * check if data exists
	 */
	public function exists($table, $conditions)
	{
		// Build WHERE clause from $conditions array
		$where = [];
		$params = [];
		foreach ($conditions as $key => $value) {
			$where[] = "$key = ?";
			$params[] = $value;
		}
		$whereClause = implode(' AND ', $where);

		$sql = "SELECT 1 FROM $table WHERE $whereClause LIMIT 1";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute($params);
		return $stmt->fetchColumn() !== false;
	}
	/**
	 * Insert data
	 */
	public function insert(array $data): bool
	{
		$columns = array_keys($data);
		$placeholders = [];
		$bindings = [];

		foreach ($data as $key => $value) {
			$placeholder = $this->getPlaceholder();
			$placeholders[] = $placeholder;
			$bindings[$placeholder] = $value;
		}

		$sql = 'INSERT INTO ' . $this->table . ' (' .
			implode(', ', array_map([$this, 'escapeIdentifier'], $columns)) . ') VALUES (' .
			implode(', ', $placeholders) . ')';

		$stmt = $this->pdo->prepare($sql);
		return $stmt->execute($bindings);
	}

	/**
	 * Update data
	 */
	public function update(array $data): bool
	{
		if (empty($data)) {
			throw new InvalidArgumentException("Update data cannot be empty");
		}

		if (empty($this->where)) {
			throw new InvalidArgumentException("Update requires WHERE clause for safety");
		}

		// Create fresh bindings for the update with unique prefixes
		$setParts = [];
		$updateBindings = [];
		$paramCounter = 1;

		// Handle SET clause with unique parameter names
		foreach ($data as $key => $value) {
			$placeholder = ':set_param_' . $paramCounter++;
			$setParts[] = $this->escapeIdentifier($key) . ' = ' . $placeholder;
			$updateBindings[$placeholder] = $value;
		}

		// Handle WHERE clause with unique parameter names
		$whereClause = '';
		if (!empty($this->where)) {
			$whereConditions = [];
			foreach ($this->bindings as $originalPlaceholder => $value) {
				$newPlaceholder = ':where_param_' . $paramCounter++;
				$updateBindings[$newPlaceholder] = $value;

				// Replace the old placeholder in the WHERE clause
				foreach ($this->where as $condition) {
					if (strpos($condition, $originalPlaceholder) !== false) {
						$whereConditions[] = str_replace($originalPlaceholder, $newPlaceholder, $condition);
						break;
					}
				}
			}
			$whereClause = ' WHERE ' . implode(' AND ', $whereConditions);
		}

		$sql = 'UPDATE ' . $this->table . ' SET ' . implode(', ', $setParts) . $whereClause;

		$stmt = $this->pdo->prepare($sql);

		try {
			$result = $stmt->execute($updateBindings);

			// Debug output (remove in production)
			error_log("Update SQL: " . $sql);
			error_log("Update Bindings: " . json_encode($updateBindings));
			error_log("Rows affected: " . $stmt->rowCount());

			return $result;
		} catch (PDOException $e) {
			error_log("Update failed: " . $e->getMessage());
			error_log("SQL: " . $sql);
			error_log("Bindings: " . json_encode($updateBindings));
			return false;
		}
	}

	/**
	 * Alternative update method with better binding handling
	 */
	public function updateSafe(array $data): bool
	{
		if (empty($data)) {
			throw new InvalidArgumentException("Update data cannot be empty");
		}

		if (empty($this->where)) {
			throw new InvalidArgumentException("Update requires WHERE clause for safety");
		}

		// Build the update query with separate binding management
		$setParts = [];
		$allBindings = [];
		$paramCounter = 1;

		// Handle SET clause
		foreach ($data as $key => $value) {
			$placeholder = ':set_param_' . $paramCounter++;
			$setParts[] = $this->escapeIdentifier($key) . ' = ' . $placeholder;
			$allBindings[$placeholder] = $value;
		}

		// Handle WHERE clause - rebuild with new placeholders
		$whereClause = '';
		if (!empty($this->where)) {
			$whereConditions = [];
			foreach ($this->bindings as $originalPlaceholder => $value) {
				$newPlaceholder = ':where_param_' . $paramCounter++;
				$allBindings[$newPlaceholder] = $value;

				// Replace the old placeholder in the WHERE clause
				foreach ($this->where as $condition) {
					if (strpos($condition, $originalPlaceholder) !== false) {
						$whereConditions[] = str_replace($originalPlaceholder, $newPlaceholder, $condition);
						break;
					}
				}
			}
			$whereClause = ' WHERE ' . implode(' AND ', $whereConditions);
		}

		$sql = 'UPDATE ' . $this->table . ' SET ' . implode(', ', $setParts) . $whereClause;

		$stmt = $this->pdo->prepare($sql);

		try {
			$result = $stmt->execute($allBindings);

			// Debug output
			echo "SQL: " . $sql . "\n";
			echo "Bindings: " . json_encode($allBindings) . "\n";
			echo "Rows affected: " . $stmt->rowCount() . "\n";

			return $result;
		} catch (PDOException $e) {
			echo "Update failed: " . $e->getMessage() . "\n";
			echo "SQL: " . $sql . "\n";
			echo "Bindings: " . json_encode($allBindings) . "\n";
			return false;
		}
	}
	/**
	 * Smart update - only updates if values actually change
	 */
	public function smartUpdate(array $data): array
	{
		if (empty($data)) {
			throw new InvalidArgumentException("Update data cannot be empty");
		}

		if (empty($this->where)) {
			throw new InvalidArgumentException("Update requires WHERE clause for safety");
		}

		// First, get the current record
		$currentRecord = $this->first();

		if (!$currentRecord) {
			return [
				'success' => false,
				'message' => 'Record not found',
				'rows_affected' => 0,
				'changes_made' => false
			];
		}

		// Check what actually needs to be updated
		$changedData = [];
		foreach ($data as $key => $newValue) {
			$currentValue = $currentRecord[$key] ?? null;

			// Only include fields that actually changed
			if ($currentValue != $newValue) {
				$changedData[$key] = $newValue;
			}
		}

		// If nothing changed, don't run update
		if (empty($changedData)) {
			return [
				'success' => true,
				'message' => 'No changes needed - record already has these values',
				'rows_affected' => 0,
				'changes_made' => false,
				'current_values' => $currentRecord
			];
		}

		// Perform the update with only changed data
		$result = $this->updateSafe($changedData);

		return [
			'success' => $result,
			'message' => $result ? 'Record updated successfully' : 'Update failed',
			'rows_affected' => $result ? 1 : 0,
			'changes_made' => true,
			'changed_fields' => array_keys($changedData),
			'old_values' => array_intersect_key($currentRecord, $changedData),
			'new_values' => $changedData
		];
	}

	/**
	 * Update with detailed response
	 */
	public function updateWithResponse(array $data): array
	{
		if (empty($data)) {
			throw new InvalidArgumentException("Update data cannot be empty");
		}

		if (empty($this->where)) {
			throw new InvalidArgumentException("Update requires WHERE clause for safety");
		}

		// Build the update query
		$setParts = [];
		$allBindings = [];
		$paramCounter = 1;

		// Handle SET clause
		foreach ($data as $key => $value) {
			$placeholder = ':set_param_' . $paramCounter++;
			$setParts[] = $this->escapeIdentifier($key) . ' = ' . $placeholder;
			$allBindings[$placeholder] = $value;
		}

		// Handle WHERE clause
		$whereClause = '';
		if (!empty($this->where)) {
			$whereConditions = [];
			foreach ($this->bindings as $originalPlaceholder => $value) {
				$newPlaceholder = ':where_param_' . $paramCounter++;
				$allBindings[$newPlaceholder] = $value;

				foreach ($this->where as $condition) {
					if (strpos($condition, $originalPlaceholder) !== false) {
						$whereConditions[] = str_replace($originalPlaceholder, $newPlaceholder, $condition);
						break;
					}
				}
			}
			$whereClause = ' WHERE ' . implode(' AND ', $whereConditions);
		}

		$sql = 'UPDATE ' . $this->table . ' SET ' . implode(', ', $setParts) . $whereClause;

		$stmt = $this->pdo->prepare($sql);

		try {
			$result = $stmt->execute($allBindings);

			return [
				'success' => $result,
				'message' => $result ? 'Update successful' : 'Update failed',
				'rows_affected' => $stmt->rowCount(),
				'sql' => $sql, // For debugging
				'bindings' => $allBindings // For debugging
			];
		} catch (PDOException $e) {
			return [
				'success' => false,
				'message' => 'Update failed: ' . $e->getMessage(),
				'sql' => $sql,
				'bindings' => $allBindings
			];
		}
	}
	/**
	 * Get number of affected rows from last operation
	 */
	public function getAffectedRows(): int
	{
		return $this->pdo->lastInsertId() ? 1 : 0; // This is a simple implementation
	}
	/**
	 * Delete records
	 */
	public function delete(): bool
	{
		$sql = 'DELETE FROM ' . $this->table;

		if (!empty($this->where)) {
			$sql .= ' WHERE ' . implode(' AND ', $this->where);
		}

		$stmt = $this->pdo->prepare($sql);
		return $stmt->execute($this->bindings);
	}

	/**
	 * Begin transaction
	 */
	public function beginTransaction(): bool
	{
		return $this->pdo->beginTransaction();
	}

	/**
	 * Commit transaction
	 */
	public function commit(): bool
	{
		return $this->pdo->commit();
	}

	/**
	 * Rollback transaction
	 */
	public function rollback(): bool
	{
		return $this->pdo->rollback();
	}

	/**
	 * Execute raw SQL query
	 */
	public function raw(string $sql, array $bindings = []): array
	{
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute($bindings);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Get the built SQL query (for debugging)
	 */
	public function toSql(): string
	{
		return $this->buildSelectQuery();
	}

	/**
	 * Get bindings (for debugging)
	 */
	public function getBindings(): array
	{
		return $this->bindings;
	}

	/**
	 * Build SELECT query
	 */
	private function buildSelectQuery(): string
	{
		$sql = 'SELECT ' . implode(', ', $this->select) . ' FROM ' . $this->table;

		if (!empty($this->joins)) {
			$sql .= ' ' . implode(' ', $this->joins);
		}

		if (!empty($this->where)) {
			$sql .= ' WHERE ' . implode(' AND ', $this->where);
		}

		if (!empty($this->groupBy)) {
			$sql .= ' GROUP BY ' . implode(', ', $this->groupBy);
		}

		if (!empty($this->having)) {
			$sql .= ' HAVING ' . implode(' AND ', $this->having);
		}

		if (!empty($this->orderBy)) {
			$sql .= ' ORDER BY ' . implode(', ', $this->orderBy);
		}

		if ($this->limit !== null) {
			$sql .= ' LIMIT ' . $this->limit;
		}

		if ($this->offset !== null) {
			$sql .= ' OFFSET ' . $this->offset;
		}

		return $sql;
	}

	/**
	 * Generate unique placeholder
	 */
	private function getPlaceholder(): string
	{
		return ':param_' . (++$this->bindingCounter);
	}

	/**
	 * Escape identifier (table/column names)
	 */
	private function escapeIdentifier(string $identifier): string
	{
		// Remove any existing backticks and add them back
		$identifier = str_replace('`', '', $identifier);

		// Handle table.column format
		if (strpos($identifier, '.') !== false) {
			$parts = explode('.', $identifier);
			return '`' . implode('`.`', $parts) . '`';
		}

		// Handle * selector
		if ($identifier === '*') {
			return '*';
		}

		return '`' . $identifier . '`';
	}

	/**
	 * Sanitize SQL operator
	 */
	private function sanitizeOperator(string $operator): string
	{
		$allowedOperators = ['=', '!=', '<>', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN'];
		$operator = strtoupper(trim($operator));

		if (!in_array($operator, $allowedOperators)) {
			throw new InvalidArgumentException("Invalid operator: {$operator}");
		}

		return $operator;
	}

	/**
	 * Get current WHERE conditions (for debugging)
	 */
	public function getWhereConditions(): array
	{
		return $this->where;
	}

	/**
	 * Get current state of QueryBuilder (for debugging)
	 */
	public function debugState(): array
	{
		return [
			'table' => $this->table,
			'select' => $this->select,
			'where' => $this->where,
			'bindings' => $this->bindings,
			'joins' => $this->joins,
			'orderBy' => $this->orderBy,
			'groupBy' => $this->groupBy,
			'having' => $this->having,
			'limit' => $this->limit,
			'offset' => $this->offset,
			'bindingCounter' => $this->bindingCounter
		];
	}

	/**
	 * Clear only WHERE conditions and bindings
	 */
	public function clearWhere(): self
	{
		$this->where = [];
		$this->bindings = [];
		$this->bindingCounter = 0;
		return $this;
	}

	/**
	 * Enhanced reset with debug info
	 */
	public function resetWithDebug(): array
	{
		$oldState = $this->debugState();

		$this->table = null;
		$this->select = ['*'];
		$this->joins = [];
		$this->where = [];
		$this->orderBy = [];
		$this->groupBy = [];
		$this->having = [];
		$this->limit = null;
		$this->offset = null;
		$this->bindings = [];
		$this->bindingCounter = 0;

		return [
			'reset' => true,
			'previous_state' => $oldState,
			'message' => 'QueryBuilder state has been reset'
		];
	}

	/**
	 * Force clean update - guarantees fresh state
	 */
	public function forceCleanUpdate(string $table, array $whereConditions, array $updateData): array
	{
		// Complete reset
		$this->reset();

		// Build fresh query
		$query = $this->table($table);

		// Add WHERE conditions
		foreach ($whereConditions as $column => $value) {
			if (is_array($value) && count($value) === 2) {
				// Format: ['operator', 'value']
				$query->where($column, $value[0], $value[1]);
			} else {
				// Simple equality
				$query->where($column, '=', $value);
			}
		}

		// Execute update
		return $query->updateWithResponse($updateData);
	}
	/**
	 * Reset query builder for reuse
	 */
	public function reset(): self
	{
		$this->table = null;
		$this->select = ['*'];
		$this->joins = [];
		$this->where = [];
		$this->orderBy = [];
		$this->groupBy = [];
		$this->having = [];
		$this->limit = null;
		$this->offset = null;
		$this->bindings = [];
		$this->bindingCounter = 0;

		return $this;
	}
}
class ServerHandler
{
	public function DebugMode($isDebug)
	{
		if ($isDebug == true) {
			error_reporting(E_ALL);
			ini_set('display_errors', 1);
		}
	}
	public function setOnMaintainence($isOnMaintainence)
	{
		if ($isOnMaintainence == true) {
			// Enable maintenance mode
			file_put_contents('maintenance.flag', '1'); // Create a flag file
			echo "The site is now in maintenance mode.";
		} else {
			// Disable maintenance mode
			if (file_exists('maintenance.flag')) {
				unlink('maintenance.flag'); // Remove the flag file
			}
			echo "The site is now live.";
		}
	}
	public function GetRequestUri()
	{
		return $_SERVER['REQUEST_URI'];
	}
	public static function UseJSON()
	{
		$json = file_get_contents('php://input');
		$data = json_decode($json, true);
		return $data;
	}
}
class RouteHelper
{
	//process all the get method route
	public static function get($cb)
	{
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			if (is_callable($cb)) {
				// Call the provided callback function
				call_user_func($cb);
			} else {
				echo "Invalid callback provided\n";
			}
		} else {
			echo "Error Unknown Request";
		}
	}

	//process all the post method route
	public static function post($cb)
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			if (is_callable($cb)) {
				// Call the provided callback function
				call_user_func($cb);
			} else {
				echo "Invalid callback provided\n";
			}
		} else {
			echo "Error Unknown Request";
		}
	}
	public static function put($cb)
	{
		if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
			if (is_callable($cb)) {
				// Call the provided callback function
				call_user_func($cb);
			} else {
				echo "Invalid callback provided\n";
			}
		} else {
			echo "Error Unknown Request";
		}
	}
	public static function patch($cb)
	{
		if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
			if (is_callable($cb)) {
				// Call the provided callback function
				call_user_func($cb);
			} else {
				echo "Invalid callback provided\n";
			}
		} else {
			echo "Error Unknown Request";
		}
	}
	public static function delete($cb)
	{
		if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
			if (is_callable($cb)) {
				// Call the provided callback function
				call_user_func($cb);
			} else {
				echo "Invalid callback provided\n";
			}
		} else {
			echo "Error Unknown Request";
		}
	}
	//route and path navigation
	public static function loadRoute($requestUri, $routes)
	{
		// Find the matching route
		$path = parse_url($requestUri, PHP_URL_PATH);

		// Loop through routes and check for a match
		foreach ($routes as $route => $action) {
			if (preg_match("#^$route$#", $path, $matches)) {
				// Call the corresponding action for the matched route
				call_user_func($action, ...$matches);
				exit;
			}
		}
	}
}

class RenderPageHelper
{
	public static function renderPage($PagePath)
	{
		$currentDir = getcwd() . '/page/';
		$filePath = $currentDir . $PagePath;

		if (preg_match('/\.[^.]+$/', $PagePath)) {
			if (file_exists($filePath)) {
				include_once($currentDir . $PagePath);
			} else {
				echo "File does not exist.";
			}
		} else {
			$filePath = $currentDir . $PagePath . '.php';//if no extension add .php by default
			if (file_exists($filePath)) {
				include_once($filePath);
			} else {
				echo "File does not exist.";
			}
		}
	}
}
class Router
{
	public static function SetPage($path)
	{
		$filepath = $path; // Define the file path
		RouteHelper::get(function () use ($filepath) { // Pass $filepath to the closure
			RenderPageHelper::renderPage($filepath);
		});
	}
	public static function Get(callable $callback)
	{
		RouteHelper::get(function () use ($callback) { // Pass $filepath to the closure
			return $callback();
		});
	}
	public static function Post(callable $callback)
	{
		RouteHelper::post(function () use ($callback) {
			return $callback();
		});
	}
	public static function Put(callable $callback)
	{
		RouteHelper::put(function () use ($callback) {
			return $callback();
		});
	}
	public static function Patch(callable $callback)
	{
		RouteHelper::patch(function () use ($callback) {
			return $callback();
		});
	}
	public static function Delete(callable $callback)
	{
		RouteHelper::delete(function () use ($callback) {
			return $callback();
		});
	}
}
class SessionService
{
	private function checkSessionTimeout($redirectUrl)
	{
		$timeout = $_SESSION['timeout'] ?? 0;
		$current_time = time();

		if ($current_time > $timeout) {
			// Session has timed out, log the user out
			session_destroy();
			header("Location: $redirectUrl"); // Redirect to the login page
			exit();
		} else {
			// Update the session timeout
			$_SESSION['timeout'] = $current_time + session_cache_expire() * 60;
		}
	}

	public static function manageSession($pageType, $url)
	{
		if (session_status() == PHP_SESSION_NONE) {
			session_start();
		}
		// session_cache_limiter('nocache');
		if ($pageType == "admin" && isset($_SESSION['user_id'])) {
			header('Location:' . $url);
			exit();
		}
		if ($pageType == "user" && !isset($_SESSION['user_id'])) {
			header('Location:' . $url);
			exit();
		}
	}

	public function startSession($userId, $email)
	{
		try {
			if (session_status() == PHP_SESSION_NONE) {
				session_start();
			}
			$_SESSION['user_id'] = $userId;
			$_SESSION['email'] = $email;
			return true;
		} catch (\Exception $e) {
			error_log("Failed to start session: " . $e->getMessage());
			return false;
		}
	}

	public function getCurrentSession($SessionVariableOne, $SessionVariableTwo)
	{
		if (session_status() == PHP_SESSION_NONE) {
			session_start();
		}

		// Check if session variables exist
		if (isset($_SESSION[$SessionVariableOne]) && isset($_SESSION[$SessionVariableTwo])) {
			return [
				$_SESSION[$SessionVariableOne],
				$_SESSION[$SessionVariableTwo],
			];
		} else {
			echo "No session variables set." . $SessionVariableOne . " " . $SessionVariableTwo;
		}
	}

	public static function sessionTimeOut($redirectUrl1, $redirectUrl2)
	{
		// Create an instance to call private methods
		$instance = new self();

		// Call checkSessionTimeout
		$instance->checkSessionTimeout($redirectUrl1);

		// Set the Session Timeout Duration
		$timeout_duration = 3 * 60 * 60; // 3 hours in seconds
		$warning_duration = 2 * 60 * 60; // 2 hours in seconds

		// Track User Activity
		$_SESSION['last_activity'] = $_SESSION['last_activity'] ?? time();

		// Check for Timeout
		$time_elapsed = time() - $_SESSION['last_activity'];

		if ($time_elapsed > $timeout_duration) {
			// Session has timed out, log the user out
			session_unset();
			session_destroy();
			header("Location: $redirectUrl2"); // Redirect to the login page
			exit();
		} elseif ($time_elapsed > $timeout_duration - $warning_duration) {
			// Optional: Show session timeout warning
			echo "Your session will expire soon. Please refresh the page to continue.";
		}

		// Reset the Session Timeout
		$_SESSION['last_activity'] = time();
	}

	public function destroySession()
	{
		// Start the session
		session_start();

		// Clear all session variables
		$_SESSION = [];

		// If the session cookie exists, delete it
		if (ini_get("session.use_cookies")) {
			$params = session_get_cookie_params();
			setcookie(
				session_name(),
				'',
				time() - 42000,
				$params["path"],
				$params["domain"],
				$params["secure"],
				$params["httponly"]
			);
		}

		// Destroy the session
		session_destroy();
	}
}

class JWT
{
	// JWT secret key (MUST match Node.js backend JWT_SECRET)
	private $jwtSecret = 'numbiatherubia123!£$*&^%$%^&*&^%kingofphusthegreat*&^%$%^&';

	// Encode JWT
	public function encodeJWT($payload, $expMinutes = 60)
	{
		$header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
		$payload['exp'] = time() + ($expMinutes * 60);
		$payload = json_encode($payload);
		$base64UrlHeader = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
		$base64UrlPayload = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');
		$signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->jwtSecret, true);
		$base64UrlSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
		return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
	}

	// Decode JWT (returns payload array or false)
	public function decodeJWT($jwt)
	{
		$parts = explode('.', $jwt);
		if (count($parts) !== 3)
			return false;
		$header = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
		$payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
		$signature = base64_decode(strtr($parts[2], '-_', '+/'));
		
		$valid = hash_hmac('sha256', $parts[0] . "." . $parts[1], $this->jwtSecret, true);
		
		// Verify signature
		if (!hash_equals($valid, $signature))
			return false;
		
		// Check expiration
		if (isset($payload['exp']) && $payload['exp'] < time())
			return false;
		return $payload;
	}

	// Verify JWT (returns true if valid, false otherwise)
	public function verifyJWT($jwt)
	{
		return $this->decodeJWT($jwt) !== false;
	}
}

// Example Usage
// SessionHandler::sessionTimeOut("https://lona-prime.com/lp/users/register");

class ToolHelper
{
	public function __construct()
	{
	}
	function loadEnv($path)
	{
		if (!file_exists($path)) {
			return;
		}

		$lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
		foreach ($lines as $line) {
			if (strpos(trim($line), '#') === 0) {
				continue;
			}

			list($name, $value) = explode('=', $line, 2);
			$name = trim($name);
			$value = trim($value);

			if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
				putenv("$name=$value");
				$_ENV[$name] = $value;
				$_SERVER[$name] = $value;
			}
		}
	}

	public function escapeForLike($string)
	{
		// Escape % and _ for SQL LIKE
		return str_replace(['%', '_'], ['\\%', '\\_'], $string);
	}
	public function sumOfDigits($number)
	{
		$numberString = (string) $number;

		// Split the string into individual digits and sum them up
		$sum = array_sum(str_split($numberString));

		return $sum;
	}
	public function sumDigitsInLoop($values)
	{
		$totalSum = 0;

		foreach ($values as $value) {
			// Convert the value to a string, split it into digits, and sum them
			$totalSum += array_sum(str_split((string) $value));
		}

		return $totalSum;
	}

	// Function to generate a unique referral code
	public function GenerateUniqueCode($length)
	{
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$code = '';
		for ($i = 0; $i <= $length; $i++) {
			$code .= $characters[rand(0, strlen($characters) - 1)];
		}
		return $code;
	}

	function checkValueExists($pdo, $tableName, $columnName, $value, $isPassword = false)
	{
		try {
			if ($isPassword) {
				$sql = "SELECT $columnName FROM $tableName WHERE $columnName = :value";
				$stmt = $pdo->prepare($sql);
				$stmt->bindParam(':value', $value);
				$stmt->execute();
				$hash = $stmt->fetchColumn();

				// If the hash exists and the password matches, return true
				if ($hash && password_verify($value, $hash)) {
					return true;
				} else {
					return false;
				}
			} else {
				$sql = "SELECT COUNT(*) FROM $tableName WHERE $columnName = :value";
				$stmt = $pdo->prepare($sql);
				$stmt->bindParam(':value', $value);
				$stmt->execute();
				$count = $stmt->fetchColumn();

				// If count is greater than 0, the value exists in the database
				if ($count > 0) {
					return true;
				} else {
					return false;
				}
			}
		} catch (PDOException $e) {
			// Handle the error as needed
			echo "Error: " . $e->getMessage();
			return false;
		}
	}
	public function SingleFileUploader($uploadDir, $FormFileInputName, $FileSize)
	{
		$AllowedFileTypes = array("jpg", "jpeg", "png", "gif");
		$filename = $_FILES[$FormFileInputName]["name"];
		$tmp_name = $_FILES[$FormFileInputName]["tmp_name"];
		$FileType = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
		$UploadOk = 1;
		$Errors = [];

		// Check for the file size
		if ($_FILES[$FormFileInputName]["size"] > $FileSize) {
			$Errors[] = "Your image is too large";
			$UploadOk = 0;
		}

		if (!in_array($FileType, $AllowedFileTypes)) {
			$Errors[] = "This FIle Type Is Not Supported";
			$UploadOk = 0;
		}

		// Check if the $UploadOk is set to 0 by an error
		if ($UploadOk == 0) {
			$response = [
				"success" => false,
				"message" => $Errors
			];
			echo json_encode($response);
		} else {
			$newFileName = uniqid() . '.' . $FileType;
			$uploaderFile = $uploadDir . $newFileName;

			if (move_uploaded_file($tmp_name, $uploaderFile)) {
				return $newFileName;
			} else {
				$response = [
					"success" => false,
					"message" => ["Sorry, there was an error uploading your file."]
				];
				echo json_encode($response);
			}
		}
	}
	public function checkIFFileUploader($uploadedDocument, $fileInputName)
	{
		if (isset($_FILES[$fileInputName]) && $_FILES[$fileInputName]['error'] == UPLOAD_ERR_OK) {
			if (!$uploadedDocument) {
				return true;
			}
		} else {
			return false;
		}
	}
	public function MultipleFileUploader($uploadDir, $FormFileInputName, $FileSize)
	{
		$AllowedFileTypes = array("jpg", "jpeg", "png", "gif");
		$UploadOk = 1;
		$Errors = [];
		$uploadedFiles = [];

		// Check if files are uploaded
		if (isset($_FILES[$FormFileInputName])) {
			// Loop through each file
			foreach ($_FILES[$FormFileInputName]["name"] as $key => $filename) {
				$tmp_name = $_FILES[$FormFileInputName]["tmp_name"][$key];
				$FileType = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

				// Check for the file size
				if ($_FILES[$FormFileInputName]["size"][$key] > $FileSize) {
					$Errors[] = "File " . $filename . " is too large.";
					$UploadOk = 0;
				}

				// Check if the file type is allowed
				if (!in_array($FileType, $AllowedFileTypes)) {
					$Errors[] = "File " . $filename . " is not an allowed image type.";
					$UploadOk = 0;
				}

				// If all checks pass, upload the file
				if ($UploadOk == 1) {
					$newFileName = uniqid() . '.' . $FileType;
					$uploaderFile = $uploadDir . $newFileName;

					if (move_uploaded_file($tmp_name, $uploaderFile)) {
						$uploadedFiles[] = $newFileName; // Store the file name for success response
					} else {
						$Errors[] = "Error uploading file " . $filename;
					}
				}
			}

			// If there were errors
			if (count($Errors) > 0) {
				$response = [
					"success" => false,
					"errors" => $Errors,
					"uploaded_files" => ''
				];
				return $response;
			} else {
				// Return the names of successfully uploaded files
				$response = [
					"success" => true,
					"uploaded_files" => $uploadedFiles,
					'errors' => ''
				];
				return $response;
			}
		} else {
			return [
				'success' => true, // or false
				'errors' => [],
				'uploaded_files' => []
			];
		}
	}

	public function HashText($text)
	{
		$hashedValue = password_hash($text, PASSWORD_BCRYPT);
		return $hashedValue;
	}
	public function VerifyPassword($plainPassword, $hashedPassword)
	{
		if (password_verify($plainPassword, $hashedPassword)) {
			return true; // Password is correct
		} else {
			return false; // Password is incorrect
		}
	}
	/**
	 * Send a JSON response with optional HTTP status code
	 */
	public function ReportBox($state, $message, $statusCode = 200)
	{
		http_response_code($statusCode);
		echo json_encode([
			"state" => $state,
			"message" => $message,
			"status" => $statusCode
		]);
	}

	// public function sendMail($to, $subject, $body, $from = 'richardandfavour@richardandfavour.live', $fromName = 'Richard And Favour', $embeddedImagePath = null)
	// {
	// 	$mail = new PHPMailer(true);

	// 	try {
	// 		// Server settings
	// 		$mail->isSMTP();
	// 		$mail->Host = 'richardandfavour.live';
	// 		$mail->SMTPAuth = true;
	// 		$mail->Username = 'richardandfavour@richardandfavour.live';
	// 		$mail->Password = '#l]QzJQT,Zgh';
	// 		$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
	// 		$mail->Port = 465;

	// 		// Recipients
	// 		$mail->setFrom($from, $fromName);
	// 		$mail->addAddress($to);

	// 		// Embed image if provided
	// 		if ($embeddedImagePath && file_exists($embeddedImagePath)) {
	// 			$cid = 'embeddedimage';
	// 			$mail->addEmbeddedImage($embeddedImagePath, $cid);
	// 			$body = str_replace('{IMAGE}', '<img src="cid:' . $cid . '" style="max-width:100%; height:auto;" />', $body);
	// 		} else {
	// 			$body = str_replace('{IMAGE}', '', $body);
	// 		}

	// 		// Content
	// 		$mail->isHTML(true);
	// 		$mail->Subject = $subject;
	// 		$mail->Body = $body;

	// 		// Send
	// 		$mail->send();
	// 		return ['success' => true, 'message' => 'Email sent successfully.'];
	// 	} catch (Exception $e) {
	// 		return ['success' => false, 'message' => "Email could not be sent. Error: {$mail->ErrorInfo}"];
	// 	}
	// }
}
