# View the Certificate

## Option 1: Direct Component Test
Change line 1 of `/src/app/App.tsx` to import and render the certificate directly:

```tsx
// At the very top of App.tsx, add this temporarily:
export default function App() {
  return <SimpleCertificate />;
}
```

## Option 2: Via YieldX Navigation
In your YieldX app, call:
```javascript
setCurrentView('certificate')
```

## What the Certificate Looks Like:

**Layout:**
- Full screen dark background (slate-950)
- White centered card with shadow
- Landscape orientation

**Content (top to bottom):**
1. Large gradient title "CERTIFICATE OF COMPLETION" (blue to purple)
2. Horizontal gradient line divider
3. Text: "This is to certify that"
4. Large recipient name with blue underline: "Ahmed Al-Balushi"
5. Text: "has successfully completed the course"
6. Course name: "Business Feasibility Study Mastery"
7. Bottom row with Date (left) and Instructor signature (right)

**Colors:**
- Background: Dark slate
- Card: White
- Accents: Blue (#1e3a8a) to Purple (#7c3aed) gradients
- Text: Slate gray and black

**Typography:**
- Title: 5xl, gradient
- Recipient name: 4xl, bold, underlined
- Course name: 2xl
- Body text: lg, gray
