// Lightweight icon set for the landing page (subset + a few new ones)
const LI = (() => {
  const Icon = ({ size = 18, stroke = 1.4, ...rest }) => (props) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...props} />
  );
  const I = ({ size = 18, stroke = 1.4, children, ...rest }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>{children}</svg>
  );
  return {
    Arrow:    (p) => <I {...p}><path d="M5 12h14M13 6l6 6-6 6" /></I>,
    ArrowUp:  (p) => <I {...p}><path d="M12 19V5M6 11l6-6 6 6" /></I>,
    Plus:     (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>,
    Check:    (p) => <I {...p}><path d="M4 12l5 5 11-12" /></I>,
    Sparkle:  (p) => <I {...p}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/><path d="M19 16l.6 1.6L21 18l-1.4.4L19 20l-.6-1.6L17 18l1.4-.4z"/></I>,
    Calendar: (p) => <I {...p}><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 9h18M8 3v4M16 3v4" /></I>,
    Lock:     (p) => <I {...p}><rect x="4" y="10" width="16" height="11" rx="1" /><path d="M8 10V7a4 4 0 018 0v3" /></I>,
    Book:     (p) => <I {...p}><path d="M4 4h7a3 3 0 013 3v14a2 2 0 00-2-2H4z" /><path d="M20 4h-7a3 3 0 00-3 3v14a2 2 0 012-2h8z" /></I>,
    Bell:     (p) => <I {...p}><path d="M6 8a6 6 0 0112 0v5l1.5 3H4.5L6 13z" /><path d="M10 19a2 2 0 004 0" /></I>,
    Receipt:  (p) => <I {...p}><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/></I>,
    Home:     (p) => <I {...p}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-4v-7H8v7H4a1 1 0 01-1-1z"/></I>,
    Shield:   (p) => <I {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></I>,
    Mail:     (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M3 7l9 6 9-6" /></I>,
    Camera:   (p) => <I {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7l1.5-3h3L15 7"/><circle cx="12" cy="13.5" r="3.5"/></I>,
    Wrench:   (p) => <I {...p}><path d="M14 6a4 4 0 014.6 5.2l3.4 3.4-3 3-3.4-3.4A4 4 0 0110.8 9l-5 5L4 12.2 9 7.2A4 4 0 0114 6z"/></I>,
    Hammer:   (p) => <I {...p}><path d="M14 6l4 4-1.5 1.5L13 8 6 15l3 3 7-7 1.5 1.5-7 7-4-4-1 1L3 14l9-9z"/></I>,
    File:     (p) => <I {...p}><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/></I>,
    Wifi:     (p) => <I {...p}><path d="M2 9a15 15 0 0120 0"/><path d="M5 13a10 10 0 0114 0"/><path d="M8.5 16.5a5 5 0 017 0"/><circle cx="12" cy="20" r="0.8" fill="currentColor"/></I>,
    Users:    (p) => <I {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M21 19c0-2-1.5-3.5-4-3.5"/></I>,
    Folder:   (p) => <I {...p}><path d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/></I>,
    Print:    (p) => <I {...p}><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="1"/><rect x="6" y="14" width="12" height="7"/></I>,
    Inventory:(p) => <I {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></I>,
    Chevron:  (p) => <I {...p}><path d="M9 6l6 6-6 6" /></I>,
    ChevronDown: (p) => <I {...p}><path d="M6 9l6 6 6-6" /></I>,
    X:        (p) => <I {...p}><path d="M6 6l12 12M18 6L6 18" /></I>,
    Dot:      (p) => <I {...p}><circle cx="12" cy="12" r="3" fill="currentColor" /></I>,
    Menu:     (p) => <I {...p}><path d="M3 6h18M3 12h18M3 18h18" /></I>,
  };
})();
window.LI = LI;
