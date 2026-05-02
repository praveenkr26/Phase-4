// Mark all reveal elements as immediately visible on page load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('visible');
  });
});
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx - 4 + 'px';
  cursor.style.top = my - 4 + 'px';
});

function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx - 18 + 'px';
  ring.style.top = ry - 18 + 'px';
  requestAnimationFrame(animRing);
}

// Small delay before starting cursor animation to ensure page is stable
setTimeout(() => {
  animRing();
}, 100);

document.querySelectorAll('a, button, .tool-card').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'scale(2.5)';
    ring.style.transform = 'scale(1.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'scale(1)';
    ring.style.transform = 'scale(1)';
  });
});

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Mark tool cards immediately as visible to fix clicking issues
document.querySelectorAll('.tool-card').forEach((el) => {
  el.classList.add('visible');
});

// Contact form
function submitForm(btn) {
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
  }, 1400);
}
