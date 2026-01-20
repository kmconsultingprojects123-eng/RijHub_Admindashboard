import { getApi,toast } from './config/_helper.js';
// console.log(getApi)
toast.info('Loading API configuration...');
    const form = document.getElementById('regAdminForm');
    const message = document.getElementById('message');
    let api = null;

    // Initialize API on page load
    (async () => {
      try {
        api = await getApi(); // This loads config + creates Axios instance
        toast.success('Ready! You can create admins now.');
        // message.style.color = 'green';
      } catch (err) {
        toast.error('Failed to load API config');
        // message.style.color = 'red';
      }
    })();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!api) {
        message.textContent = 'API not ready yet...';
        return;
      }

      const adminData = {
        name:     document.getElementById('name').value,
        email:    document.getElementById('email').value,
        password: document.getElementById('password').value,
        adminCode: '1234ABCD', // example of extra field your API might need
        permissions: { verifyArtisans: true }
      };

      try {
        // const res = await api.post('/admin/create', adminData,{
        const res = await api.post('/auth/register', adminData,{
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // timeout: 15000
            }
        });
        form.reset();
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || 'Failed to create admin');
        // message.style.color = 'red';
        // message.textContent = err.response?.data?.message || 'Failed to create admin';
      }
    });