const nav = document.getElementById('siteNav');
const links = document.querySelectorAll('#menuList a');

// Change nav style on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Smooth scroll + active link
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});
