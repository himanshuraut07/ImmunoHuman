# ImmunoHuman Research — Website

A dynamic, animated marketing site for ImmunoHuman Research, a
clinical research company based in Nagpur, Maharashtra, India. Includes a hero
section with an animated DNA double-helix (HTML5 Canvas), scroll-triggered
reveals, an expandable specialities grid, and a Python/Flask backend that
receives and stores contact-form submissions.

## Files

| File               | Purpose                                              |
|--------------------|-------------------------------------------------------|
| `index.html`       | Page structure and content                           |
| `style.css`        | All styling, layout, and CSS animation                |
| `script.js`        | DNA canvas animation, scroll interactions, form logic |
| `app.py`           | Flask backend — serves the site + `/api/contact`      |
| `requirements.txt` | Python dependencies                                   |
| `assets/logo.png`  | Company logo                                          |
| `submissions.db`   | Created automatically — stores contact-form entries   |

## Option A — View instantly, no setup

Just open `index.html` in a browser. Everything works — animation,
navigation, scroll effects, the expandable specialities grid — **except**
the contact form, which will show a friendly local message instead of
submitting to a server (since there's no backend running to receive it).

## Option B — Run with the Python backend (recommended)

This enables the contact form to actually save enquiries (and optionally
email your team).

```bash
cd ihresearch
pip install -r requirements.txt
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

Submitted enquiries are stored in `submissions.db` (SQLite) and can be
viewed as JSON at **http://127.0.0.1:5000/api/submissions** (add
authentication before exposing this publicly).

### Enabling real email delivery (optional)

By default, form submissions are safely stored but not emailed. To send a
notification email for every enquiry, set these environment variables
before running `app.py` (Gmail example — use an
[App Password](https://myaccount.google.com/apppasswords), not your normal
password):

```bash
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-address@gmail.com"
export SMTP_PASS="your-app-password"
python app.py
```

## Customising

- **Colors & fonts** — edit the CSS custom properties at the top of
  `style.css` (`:root { ... }`).
- **Specialities content** — edit the `specialities` array near the top of
  `script.js`.
- **Contact details / address** — edit directly in `index.html` inside the
  `#contact` section.

## Deploying

Any host that runs Python/Flask (Render, PythonAnywhere, a VPS, etc.) will
work. Point your WSGI server at `app.py`'s `app` object, and make sure the
working directory contains `index.html`, `style.css`, `script.js`, and the
`assets/` folder alongside it.
