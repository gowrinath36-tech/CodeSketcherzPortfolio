# Code Sketchers — Full-screen creative studio site

An original, Studio Damini-inspired concept site using HTML, CSS and vanilla JavaScript. It is not an exact copy of the reference.

## Run
Open `index.html` in a browser, or serve this folder with VS Code Live Server.

## Navigation
- Fixed header section tabs jump directly between full-screen panels.
- Bottom Previous / Next controls move one section at a time.
- Left/right arrows and Page Up/Page Down also navigate (when not editing a form field).
- The document is locked from normal scrolling; individual panels can internally scroll if needed.

## Colors
- Digital Yellow: `#FFC928`
- Electric Blue: `#2563EB`
- Deep Black: `#171717`
- Pure White: `#FFFFFF`

## Notes
The content and studio identity are original placeholder content. Contact form uses a `mailto:` link and does not submit to a server. Replace the email and branding with your own before publishing.


## Navigation behavior
- The hero is not a header navigation item; the header remains visible on the hero.
- Header links navigate to the six inner sections.
- The bottom control is only Next Section (no page counter and no Previous button).
- Browser Back returns to the hero after entering the section experience; use header links to move between sections.


### Next button visibility
The bottom Next Section button is hidden on the Hero section. It becomes visible when visitors open About Page or any later section. There is no next control on the hero itself; use the header to enter the site.
