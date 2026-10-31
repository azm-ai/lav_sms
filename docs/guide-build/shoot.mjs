// Captures guide screenshots from the running local app (read-only: GET pages only).
// Usage: node shoot.mjs   (expects php artisan serve on http://127.0.0.1:8000)
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = 'http://127.0.0.1:8000';
const OUT = fileURLToPath(new URL('./shots/', import.meta.url));
mkdirSync(OUT, { recursive: true });

// n: callout number, sel: element to mark, label: legend text
const S = {
  sidebar: { sel: '.sidebar-main .nav-sidebar', label: 'Sidebar menu: only shows modules this role may use' },
  user: { sel: '.dropdown-user > a', label: 'User menu: My profile, Account settings, Logout' },
  session: { sel: '#page-header .header-elements .btn-float', label: 'Current academic session' },
  title: { sel: '#page-header .page-title h4', label: 'Page title' },
};

const roles = {
  super_admin: 'cj@cj.com', admin: 'admin@admin.com', teacher: 'teacher@teacher.com',
  accountant: 'accountant@accountant.com', student: 'student@student.com', parent: 'parent@parent.com',
};

// [file, path, callouts[], options]
const plan = {
  guest: [
    ['login', '/login', [
      { sel: 'input[name=identity]', label: 'Login ID (username) or email' },
      { sel: 'input[name=password]', label: 'Password' },
      { sel: 'a[href*="password/reset"]', label: 'Forgot password link' },
      { sel: 'button[type=submit]', label: 'Sign in' },
    ]],
  ],
  super_admin: [
    ['sa-dashboard', '/dashboard', [S.sidebar, { sel: '.slms-stats', label: 'Totals of students, teachers, admins and parents' }, { sel: '.fullcalendar-basic', label: 'Events calendar (template demo data, not stored in the database)' }, S.session, S.user]],
    ['sa-students-list', '/students/list/1', [
      { sel: '.nav-tabs', label: 'Tabs: all students in the class, or one section' },
      { sel: '.dataTables_filter input', label: 'Filter box: type to search the table' },
      { sel: '.dt-buttons', label: 'Export: Copy, Excel, PDF, choose columns' },
      { sel: 'table tbody tr:first-child td:last-child .list-icons', label: 'Row actions menu: view, edit, reset password, delete' },
    ], { content: 1, h: 880 }],
    ['sa-student-admit', '/students/create', [
      { sel: '.steps ul, .wizard .steps', label: 'Two steps: Personal data, then Student data' },
      { sel: 'input[name=name]', label: 'Required fields are marked with *' },
      { sel: '.actions a[href="#next"]', label: 'Next / Previous move between steps; Submit on the last step' },
    ], { content: 1, h: 760 }],
    ['sa-classes', '/classes', [{ sel: '.nav-tabs', label: 'Manage classes, or open "Add Class"' }, { sel: 'table', label: 'Class list with class type' }], { content: 1, h: 620 }],
    ['sa-sections', '/sections', [{ sel: '.nav-tabs', label: 'Sections are grouped by class; "Add Section" tab creates one' }]],
    ['sa-subjects', '/subjects', [{ sel: '.nav-tabs', label: 'Add Subject, then subjects per class with their teacher' }], { content: 1, h: 560 }],
    ['sa-exams', '/exams', [{ sel: '.nav-tabs', label: 'Manage Exam list and "Add Exam" (name and term)' }], { content: 1, h: 420 }],
    ['sa-grades', '/grades', [{ sel: 'table', label: 'Grade scale: grade name, mark range and remark' }], { content: 1, h: 620 }],
    ['sa-marks-select', '/marks', [{ sel: 'form[action*="marks/selector"]', label: 'Choose Exam, Class, Section and Subject, then "Manage Marks"' }], { content: 1, h: 330 }],
    ['sa-tabulation', '/marks/tabulation', [{ sel: 'form', label: 'Choose Exam, Class and Section, then "View Sheet"' }], { h: 330 }],
    ['sa-marksheet-select', '/marks/bulk', [{ sel: 'form', label: 'Choose Class and Section to list students and open their marksheets' }], { content: 1, h: 330 }],
    ['sa-payment-create', '/payments/create', [
      { sel: 'input[name=title]', label: 'Fee title, for example "School Fees"' },
      { sel: 'select[name=my_class_id] + .select2, select[name=my_class_id]', label: 'Class (leave empty for all classes)' },
      { sel: 'input[name=amount]', label: 'Amount (currency sign is the Nigerian Naira)' },
    ], { content: 1, h: 560 }],
    ['sa-payments', '/payments', [], { content: 1, h: 600 }],
    ['sa-student-payments', '/payments/manage/1', [
      { sel: 'form[action*="select_class"]', label: 'Pick a class and press Submit to generate fee records' },
      { sel: 'table tbody tr:first-child td:last-child .btn', label: 'Manage Payments: open the student invoice' },
    ], { content: 1, h: 760 }],
    ['sa-timetables', '/timetables', [{ sel: '.nav-tabs', label: 'Create a timetable record, then add time slots and subjects' }], { content: 1, h: 400 }],
    ['sa-settings', '/super_admin/settings', [
      { sel: 'input[name=system_name]', label: 'School name shown across the system' },
      { sel: 'select[name=current_session] + .select2, select[name=current_session]', label: 'Current session: drives students, marks and fees' },
      { sel: 'select[name=lock_exam] + .select2, select[name=lock_exam]', label: 'Lock exam: requires PINs to view results' },
      { sel: 'input[name=logo]', label: 'Upload school logo' },
    ]],
    ['sa-users', '/users', [{ sel: '.nav-tabs', label: '"Create New User" or "Manage Users" by type' }, { sel: 'select[name=user_type] + .select2, select[name=user_type]', label: 'User type (an Admin is offered only teacher, parent and accountant)' }], { content: 1, h: 820 }],
    ['sa-promotion', '/students/promotion', [{ sel: 'form', label: 'From class/section to class/section, then load students' }], { content: 1, h: 330 }],
    ['sa-graduated', '/students/graduated', [], { content: 1, h: 600 }],
    ['sa-dorms', '/dorms', [], { content: 1, h: 600 }],
    ['sa-my-account', '/my_account', [{ sel: '.nav-tabs', label: 'Change Password, or Manage Profile' }], { content: 1, h: 430 }],
    ['sa-profile', '@profile', [], { content: 1, h: 700 }],
  ],
  admin: [
    ['admin-dashboard', '/dashboard', [S.sidebar], { h: 640 }],
  ],
  teacher: [
    ['teacher-dashboard', '/dashboard', [S.sidebar], { h: 640 }],
    ['teacher-marks', '/marks', [], { content: 1, h: 330 }],
  ],
  accountant: [
    ['accountant-dashboard', '/dashboard', [S.sidebar], { h: 640 }],
    ['accountant-payments', '/payments/manage/1', [], { content: 1, h: 700 }],
  ],
  student: [
    ['student-dashboard', '/dashboard', [S.sidebar], { h: 640 }],
    ['student-profile', '@profile', [{ sel: '.card .text-center', label: 'Photo and name' }, { sel: '.tab-content table', label: 'Personal and class details' }], { content: 1, h: 560 }],
    ['student-marksheet', '@marksheet', [{ sel: 'form', label: 'Select the academic year, then view the marksheet' }]],
  ],
  parent: [
    ['parent-dashboard', '/dashboard', [S.sidebar], { h: 640 }],
    ['parent-children', '/my_children', [], { content: 1, h: 420 }],
  ],
};

const mobile = {
  guest: [['m-login', '/login']],
  super_admin: [['m-dashboard', '/dashboard'], ['m-students-list', '/students/list/1']],
};

async function annotate(page, callouts) {
  return page.evaluate((callouts) => {
    const used = [];
    let n = 0;
    for (const c of callouts) {
      const el = [...document.querySelectorAll(c.sel)].find(e => { const b = e.getBoundingClientRect(); return b.width && b.height; });
      if (!el) continue;
      const r = el.getBoundingClientRect();
      n++;
      const box = document.createElement('div');
      Object.assign(box.style, { position: 'absolute', left: (r.left + scrollX - 3) + 'px', top: (r.top + scrollY - 3) + 'px', width: (r.width + 6) + 'px', height: (r.height + 6) + 'px', border: '2px solid #16A34A', borderRadius: '8px', zIndex: 99998, pointerEvents: 'none' });
      const dot = document.createElement('div');
      dot.textContent = n;
      Object.assign(dot.style, { position: 'absolute', left: Math.max(4, r.left + scrollX - 16) + 'px', top: Math.max(4, r.top + scrollY - 16) + 'px', width: '28px', height: '28px', borderRadius: '50%', background: '#166534', color: '#fff', font: '700 15px/28px Segoe UI, Arial', textAlign: 'center', zIndex: 99999, boxShadow: '0 0 0 3px #fff', pointerEvents: 'none' });
      document.body.append(box, dot);
      used.push({ n, label: c.label });
    }
    return used;
  }, callouts);
}

async function login(ctx, id) {
  const page = await ctx.newPage();
  await page.goto(BASE + '/login');
  await page.fill('input[name=identity]', id);
  await page.fill('input[name=password]', 'cj');
  await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);
  return page;
}

async function resolve(page, path) {
  if (path === '@profile') {
    await page.goto(BASE + '/dashboard');
    return page.$eval('.dropdown-user .dropdown-menu a', a => a.href);
  }
  if (path === '@marksheet') {
    await page.goto(BASE + '/dashboard');
    return page.$eval('a[href*="marks/select_year"]', a => a.href);
  }
  return BASE + path;
}

async function shot(page, file, url, callouts, legend, maxH = 1000, x0 = 0) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.mouse.move(0, 0);
  const used = callouts.length ? await annotate(page, callouts) : [];
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const w = page.viewportSize().width;
  await page.screenshot({ path: OUT + file + '.jpg', type: 'jpeg', quality: 86, clip: { x: x0, y: 0, width: w - x0, height: Math.min(h, maxH) }, fullPage: true });
  legend[file] = { url: url.replace(BASE, ''), callouts: used, title: await page.title() };
  console.log('shot', file, used.length, 'callouts');
}

const browser = await chromium.launch({ channel: 'chrome' });
const legend = {};
for (const [role, items] of Object.entries(plan)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = role === 'guest' ? await ctx.newPage() : await login(ctx, roles[role]);
  for (const [file, path, callouts, o = {}] of items) {
    try { await shot(page, file, await resolve(page, path), callouts, legend, o.h || 1000, o.content ? 270 : 0); }
    catch (e) { console.log('FAIL', file, e.message.split('\n')[0]); legend[file] = { error: e.message.split('\n')[0] }; }
  }
  const m = mobile[role];
  if (m) {
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mp = role === 'guest' ? await mctx.newPage() : await login(mctx, roles[role]);
    for (const [file, path] of m) await shot(mp, file, BASE + path, [], legend, 1700);
    await mctx.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(OUT + 'legend.json', JSON.stringify(legend, null, 2));
