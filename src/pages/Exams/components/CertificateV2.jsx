import React, { useState } from "react";

/* ── Brand tokens adapted to OpenFPV Light Theme ── */
const B = {
  bgPrimary:  "#ffffff", // Main certificate background
  bgSecondary:"#f8fafc", // Header/Footer background
  border:     "#e2e8f0", // Borders and dividers
  cyan:       "#2563eb", // OpenFPV accent-primary (Blue 600 for contrast)
  cyanDark:   "#1d4ed8",
  teal:       "#0ea5e9", 
  purple:     "#7c3aed",
  
  textMain:   "#0f172a", // Dark text for titles and names
  textMuted:  "#475569", // Medium text for descriptions
  textFaint:  "#94a3b8", // Light text for small labels
  
  gridLine:   "rgba(37,99,235,0.08)", // Light blue grid lines
};

export default function CertificateV2({ 
  studentName, 
  examName = "Comprehensive FPV Master Certification Exam", 
  rollNo, 
  examColor = B.cyan, 
  timestamp,
  isPreview = false
}) {
  const name = studentName?.trim() || "STUDENT NAME";
  
  // Use state to ensure purity during re-renders
  const [currentTimestamp] = useState(() => timestamp || Date.now());

  const dateObj = new Date(currentTimestamp);
  const date = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  
  const accentColor = examColor;
  const alpha = isPreview ? 0.95 : 1; // Keep mostly opaque so they can see design, rely on watermark

  // Fallback rollNo if not provided
  let roll = rollNo;
  if (!roll) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    roll = `EGR-MST-${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <div
        id="certificate-area"
        style={{
          width: "100%",
          maxWidth: 1056, // Standard Letter width (11 inches at 96dpi)
          minHeight: 816, // Standard Letter height (8.5 inches at 96dpi)
          margin: "0 auto",
          background: B.bgPrimary,
          borderRadius: 12, // Increased border radius
          overflow: "hidden", // Ensures background stays inside
          boxShadow: isPreview
            ? "none"
            : "0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(37,99,235,0.15)",
          opacity: alpha,
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(${B.gridLine} 1px, transparent 1px),
            linear-gradient(90deg, ${B.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

        {/* Outer Official Border (Now on TOP of content to fix corners) */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          border: `8px solid #93c5fd`, // Significantly thicker outer border
          borderRadius: 12,
          pointerEvents: "none",
        }} />
        
        {/* Inner Official Border (Double Line Effect) */}
        <div style={{
          position: "absolute", inset: 14, zIndex: 10,
          border: `2px solid #60a5fa`, // Thicker, more visible inner border
          borderRadius: 6,
          pointerEvents: "none",
        }} />

        {/* ── HEADER BAND ── */}
        <div style={{
          position: "relative", zIndex: 2,
          background: `linear-gradient(135deg, ${B.bgSecondary} 0%, #f1f5f9 100%)`,
          borderBottom: `2px solid ${accentColor}`,
          padding: "32px 56px", // Increased padding to clear the new thick borders
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo area */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L30 16L16 30L2 16Z" stroke={accentColor} strokeWidth="1.5" fill="none"/>
              <path d="M16 8L24 16L16 24L8 16Z" fill={accentColor} opacity="0.15"/>
              <circle cx="16" cy="16" r="3" fill={accentColor}/>
            </svg>
            <div>
              <div style={{ color: accentColor, fontSize: 16, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase" }}>
                EGIREROBOTICS
              </div>
              <div style={{ color: B.textFaint, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginTop: 2, fontWeight: 600 }}>
                DGCA Certified Training Academy
              </div>
            </div>
          </div>

          {/* Roll number */}
          <div style={{ textAlign: "right" }}>
            <div style={{ color: B.textFaint, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>
              Certificate No.
            </div>
            <div style={{ color: accentColor, fontFamily: "'Courier New', monospace", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
              {roll}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ position: "relative", zIndex: 2, padding: "44px 56px 36px" }}>

          {/* Exam badge — top center */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `${accentColor}08`,
              border: `1px solid ${accentColor}25`,
              borderRadius: 100,
              padding: "6px 20px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor }} />
              <span style={{ color: accentColor, fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
                {examName}
              </span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor }} />
            </div>
          </div>

          {/* Main title */}
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <div style={{ color: B.textFaint, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
              This is to certify that
            </div>
          </div>

          {/* Student name */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{
              fontSize: Math.max(28, Math.min(52, 52 - Math.max(0, name.length - 12) * 1.5)),
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: B.textMain,
              lineHeight: 1.1,
              textShadow: `0 4px 12px ${accentColor}15`,
            }}>
              {name}
            </div>
          </div>

          {/* Cyan underline */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{
              height: 3,
              width: 120,
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }} />
          </div>

          {/* Achievement text */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ color: B.textMuted, fontSize: 13.5, lineHeight: 1.8, maxWidth: 560, margin: "0 auto", fontWeight: 500 }}>
              has successfully completed the examination and demonstrated{" "}
              <span style={{ color: B.textMain, fontWeight: 700 }}>technical excellence</span>{" "}
              and <span style={{ color: B.textMain, fontWeight: 700 }}>practical proficiency</span>{" "}
              in the field of
            </div>
            <div style={{
              marginTop: 10,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1,
              color: accentColor,
              textTransform: "uppercase",
            }}>
              FPV Drone Piloting, Building & Engineering
            </div>
            <div style={{ color: B.textFaint, fontSize: 12, marginTop: 4, fontWeight: 600 }}>
              OpenFPV Certification Program
            </div>
          </div>

          {/* Stat pills */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 44,
            flexWrap: "wrap",
          }}>
            {[
              { val: "100%", label: "Completion" },
              { val: "DGCA", label: "Certified" },
              { val: "Master", label: "Performance" },
            ].map(({ val, label }) => (
              <div key={label} style={{
                background: "linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 100%)",
                border: "1px solid #7dd3fc",
                borderRadius: 12,
                padding: "12px 28px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(125,211,252,0.15)",
              }}>
                <div style={{ color: "#0284c7", fontSize: 16, fontWeight: 800 }}>{val}</div>
                <div style={{ color: "#475569", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginTop: 4, fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${B.border}`, marginBottom: 28 }} />

          {/* Signature + seal row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>

            {/* Signature block */}
            <div>
              <div style={{
                fontFamily: "'Pacifico', 'Dancing Script', cursive",
                fontSize: 30,
                color: B.textMain,
                lineHeight: 1.2,
                marginBottom: 6,
              }}>
                Yogesh Joga
              </div>
              <div style={{
                width: 180,
                height: 1,
                background: `linear-gradient(90deg, ${B.border}, transparent)`,
                marginBottom: 8,
              }} />
              <div style={{ color: B.textMain, fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
                Yogesh Joga
              </div>
              <div style={{ color: B.textMuted, fontSize: 11, marginTop: 2, fontWeight: 500 }}>
                DGCA Certified Drone Pilot & Trainer
              </div>
              <div style={{ color: B.textMuted, fontSize: 11, fontWeight: 500 }}>
                Founder, <span style={{ color: accentColor, fontWeight: 700 }}>EGIREROBOTICS</span>
              </div>
            </div>

            {/* Center — QR/seal placeholder */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 72, height: 72,
                border: `2px solid ${accentColor}40`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
                background: `${accentColor}08`,
                position: "relative",
              }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M18 4L32 12V24L18 32L4 24V12Z" stroke={accentColor} strokeWidth="1" fill="none"/>
                  <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5Z" fill={accentColor} opacity="0.15"/>
                  <circle cx="18" cy="18" r="4" fill={accentColor}/>
                  <path d="M18 4V10M18 26V32M4 12L10 15M26 21L32 24M4 24L10 21M26 15L32 12" stroke={accentColor} strokeWidth="0.75" opacity="0.5"/>
                </svg>
                <div style={{
                  position: "absolute", inset: -4,
                  borderRadius: "50%",
                  border: `1px dashed ${accentColor}30`,
                }} />
              </div>
              <div style={{ color: B.textFaint, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                Official Seal
              </div>
            </div>

            {/* Issue date block */}
            <div style={{ textAlign: "right" }}>
              <div style={{ color: B.textFaint, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
                Date of Issue
              </div>
              <div style={{ color: B.textMain, fontSize: 13, fontWeight: 700 }}>
                {date}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ color: B.textFaint, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
                  Verify Online
                </div>
                <div style={{
                  color: accentColor,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  letterSpacing: 0.5,
                  fontWeight: 600
                }}>
                  egirerobotics.com/verify
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER BAND ── */}
        <div style={{
          position: "relative", zIndex: 2,
          background: `linear-gradient(90deg, ${accentColor}10, ${B.purple}10)`,
          borderTop: `1px solid ${accentColor}20`,
          padding: "10px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ color: B.textMuted, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
            EGIREROBOTICS · Professional FPV Learning
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["FPV Build", "ESC", "FC", "Soldering", "Piloting"].map(tag => (
              <span key={tag} style={{ color: B.textFaint, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
          <div style={{ color: B.textMuted, fontSize: 9, letterSpacing: 1, fontWeight: 600 }}>
            dgca.gov.in · Certified
          </div>
        </div>

        {/* ── WATERMARK OVERLAY ── */}
        {isPreview && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 100,
            display: "flex", justifyContent: "center", alignItems: "center",
            pointerEvents: "none", overflow: "hidden"
          }}>
            <div style={{
              color: "rgba(239, 68, 68, 0.12)", // Red with low opacity
              fontSize: "140px",
              fontWeight: 900,
              transform: "rotate(-35deg)",
              whiteSpace: "nowrap",
              userSelect: "none",
              textTransform: "uppercase",
              letterSpacing: "10px",
              textShadow: "0 0 20px rgba(239,68,68,0.2)"
            }}>
              Preview Only
            </div>
            {/* Tiled Watermark */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Ctext x='50%25' y='50%25' font-size='32' fill='rgba(239,68,68,0.05)' font-family='sans-serif' font-weight='bold' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 200 200)'%3EUNOFFICIAL PREVIEW%3C/text%3E%3C/svg%3E")`,
              pointerEvents: "none",
            }} />
          </div>
        )}
      </div>
    </>
  );
}
