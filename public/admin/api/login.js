import { getApi, toast } from './config/_helper.js';
// console.log(getApi)
// toast.info('Loading API configuration...');
const form = document.querySelector('.loginAdminForm');
const message = document.getElementById('message');
let api = null;

// Initialize API on page load
(async () => {
  try {
    api = await getApi(); // This loads config + creates Axios instance
    // toast.success('Ready! You can create admins now.');
    // message.style.color = 'green';
  } catch (err) {
    toast.error('Failed to load API config');
    // message.style.color = 'red';
  }
})();
// console.log(form);
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('🔐 [LOGIN] Form submitted');
  
  if (!api) {
    console.error('❌ [LOGIN] API not ready yet');
    toast.error('API not ready yet...');
    return;
  }

  const adminData = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };
  
  console.log('📤 [LOGIN] Sending login request with email:', adminData.email);
  
  try {
    const res = await api.post('/auth/login', adminData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    console.log('📥 [LOGIN] Response received:', res.data);
    
    if(res.data.success){
      const token = res.data.token;
      console.log('✅ [LOGIN] Login successful! Token:', token?.substring(0, 20) + '...');
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('💾 [LOGIN] Token saved to localStorage');
      
      // Store token in cookie
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `token=${encodeURIComponent(token)}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`;
      console.log('🍪 [LOGIN] Token saved to cookie (expires in 7 days)');
      
      // Verify storage
      const storedToken = localStorage.getItem('token');
      console.log('🔍 [LOGIN] Verification - localStorage has token:', !!storedToken);
      console.log('🔍 [LOGIN] Verification - cookie has token:', document.cookie.includes('token='));
      
      toast.success('Login successful! Redirecting...');
      
      console.log('🔄 [LOGIN] Redirecting to /artisanadmin/');
      setTimeout(() => {
        window.location.href = '/aa/admin/';
      }, 500);
    }
    else{
      console.error('❌ [LOGIN] Login failed:', res.data.message);
      toast.error(res.data.message || 'Login failed');
    }
    // localStorage.setItem('token', res.data.token);
    // window.location.href = '/admin/';
    form.reset();
  } catch (err) {
    console.log(err);
    toast.error(err.response?.data?.message || 'Failed to login admin');
    // message.style.color = 'red';
    // message.textContent = err.response?.data?.message || 'Failed to create admin';
  }
});