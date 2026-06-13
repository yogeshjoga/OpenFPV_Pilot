import React from "react";

/* ─────────────────────────────────────────────
   Inline styles (certificate-specific)
───────────────────────────────────────────── */
const styles = {
  /* ── CERTIFICATE SHELL ── */
  certOuter: {
    width: "860px",
    maxWidth: "100%",
    background: "#1a2b5e",
    padding: "8px",
    borderRadius: "4px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    margin: "0 auto",
  },

  certBorder: {
    border: "3px solid #c9a84c",
    borderRadius: "2px",
    padding: "0",
    position: "relative",
    overflow: "hidden",
  },

  /* dark top band */
  topBand: {
    background: "#1a2b5e",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "28px",
  },

  rollNo: {
    color: "#c9a84c",
    fontFamily: "'Georgia', serif",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "0.5px",
  },

  /* white content area */
  certContent: {
    background: "#ffffff",
    position: "relative",
    padding: "36px 60px 28px",
    overflow: "hidden",
  },

  /* hex watermark pattern */
  hexPattern: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.04,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='64'%3E%3Cpath d='M28 4 L52 18 L52 46 L28 60 L4 46 L4 18 Z' fill='none' stroke='%231a2b5e' stroke-width='1.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
  },

  certInner: { position: "relative", zIndex: 1, textAlign: "center" },

  certTitle: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontWeight: "900",
    fontSize: "62px",
    color: "#1a2b5e",
    letterSpacing: "4px",
    lineHeight: 1.05,
    textTransform: "uppercase",
    margin: "0 0 2px",
  },

  certSubtitle: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontWeight: "700",
    fontSize: "22px",
    color: "#c9a84c",
    letterSpacing: "8px",
    textTransform: "uppercase",
    margin: "0 0 20px",
  },

  presentedTo: {
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
    fontWeight: "700",
    fontSize: "16px",
    color: "#c9a84c",
    letterSpacing: "1px",
    margin: "0 0 10px",
  },

  studentName: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontWeight: "900",
    fontSize: "52px",
    color: "#1a2b5e",
    letterSpacing: "3px",
    textTransform: "uppercase",
    lineHeight: 1.1,
    margin: "0 0 10px",
  },

  nameDivider: {
    border: "none",
    borderTop: "2px solid #c9a84c",
    width: "100%",
    margin: "0 0 18px",
  },

  certBody: {
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
    fontWeight: "700",
    fontSize: "13.5px",
    color: "#1a2b5e",
    lineHeight: 1.65,
    margin: "0 auto 30px",
    maxWidth: "640px",
  },

  sigSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0px",
  },

  sigScript: {
    fontFamily: "'Pacifico', 'Dancing Script', cursive",
    fontSize: "34px",
    color: "#1a2b5e",
    lineHeight: 1.2,
  },

  sigLine: {
    border: "none",
    borderTop: "1.5px solid #1a2b5e",
    width: "220px",
    margin: "4px 0 6px",
  },

  sigName: {
    fontFamily: "'Georgia', serif",
    fontWeight: "700",
    fontSize: "14px",
    color: "#1a2b5e",
    letterSpacing: "3px",
    textTransform: "uppercase",
  },

  sigTitle1: {
    fontFamily: "'Georgia', serif",
    fontSize: "13px",
    color: "#1a2b5e",
    marginTop: "4px",
  },

  sigTitle2: {
    fontFamily: "'Georgia', serif",
    fontSize: "13px",
    color: "#1a2b5e",
  },

  /* gold bottom band */
  bottomBand: {
    background: "linear-gradient(90deg, #c9a84c 0%, #e8d48b 40%, #c9a84c 70%, #a07830 100%)",
    height: "56px",
  },

  /* corner ornaments */
  corner: {
    position: "absolute",
    width: "48px",
    height: "48px",
    zIndex: 2,
  },

  /* purple inner accent lines */
  purpleLineTop: {
    position: "absolute",
    top: "56px",
    left: 0,
    right: 0,
    height: "3px",
    background: "#6a3fa0",
    zIndex: 2,
  },
  purpleLineBottom: {
    position: "absolute",
    bottom: "56px",
    left: 0,
    right: 0,
    height: "3px",
    background: "#6a3fa0",
    zIndex: 2,
  },
};

/* ─────────────────────────────────────────────
   Corner SVG ornament
───────────────────────────────────────────── */
const CornerOrnament = ({ position }) => {
  return (
    <svg
      style={{
        ...styles.corner,
        top: position.includes("t") ? 0 : "auto",
        bottom: position.includes("b") ? 0 : "auto",
        left: position.includes("l") ? 0 : "auto",
        right: position.includes("r") ? 0 : "auto",
      }}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4 L20 4 L20 8 L8 8 L8 20 L4 20 Z"
        fill="#c9a84c"
        transform={
          position === "tl"
            ? ""
            : position === "tr"
            ? "translate(48,0) scale(-1,1)"
            : position === "bl"
            ? "translate(0,48) scale(1,-1)"
            : "translate(48,48) scale(-1,-1)"
        }
      />
      <path
        d="M4 4 L14 4 L14 6 L6 6 L6 14 L4 14 Z"
        fill="#e8d48b"
        transform={
          position === "tl"
            ? ""
            : position === "tr"
            ? "translate(48,0) scale(-1,1)"
            : position === "bl"
            ? "translate(0,48) scale(1,-1)"
            : "translate(48,48) scale(-1,-1)"
        }
      />
    </svg>
  );
};

/* ─────────────────────────────────────────────
   Certificate Component
───────────────────────────────────────────── */
export default function Certificate({ studentName, timestamp, isPreview = false }) {
  const displayName = studentName?.trim() || "STUDENT FULL NAME";

  // Use state to ensure purity during re-renders
  const [currentTimestamp] = React.useState(() => timestamp || Date.now());

  // Generate a unique Roll No based on date and time
  const dateObj = new Date(currentTimestamp);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  const rollNoString = `Roll No: OFP-MST-${year}${month}${day}-${hours}${minutes}${seconds}`;

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      <div style={{...styles.certOuter, position: "relative", overflow: "hidden", opacity: isPreview ? 0.95 : 1}} id="certificate-area">
        <div style={styles.certBorder}>
          {/* Purple accent lines */}
          <div style={styles.purpleLineTop} />
          <div style={styles.purpleLineBottom} />

          {/* Corner ornaments */}
          <CornerOrnament position="tl" />
          <CornerOrnament position="tr" />
          <CornerOrnament position="bl" />
          <CornerOrnament position="br" />

          {/* Top dark band with roll number */}
          <div style={styles.topBand}>
            <div style={styles.rollNo}>{rollNoString}</div>
          </div>

          {/* Main white content */}
          <div style={styles.certContent}>
            <div style={styles.hexPattern} />
            <div style={styles.certInner}>
              {/* Title */}
              <div style={styles.certTitle}>Certificate</div>
              <div style={styles.certSubtitle}>of Achievement</div>

              {/* Presented to */}
              <div style={styles.presentedTo}>
                This certificate is proudly presented to
              </div>

              {/* Student Name */}
              <div style={styles.studentName}>{displayName}</div>
              <hr style={styles.nameDivider} />

              {/* Body text */}
              <div style={styles.certBody}>
                For successfully completing the Comprehensive FPV Master Certification Exam on {formattedDate}, demonstrating technical excellence and practical proficiency in FPV drone piloting, building, and engineering.
              </div>

              {/* Signature section */}
              <div style={styles.sigSection}>
                <div style={styles.sigScript}>Yogesh Joga</div>
                <hr style={styles.sigLine} />
                <div style={styles.sigName}>Yogesh Joga</div>
                <div style={styles.sigTitle1}>
                  DGCA Certified drone pilot and Trainer
                </div>
                <div style={styles.sigTitle2}>
                  Founder of <strong>EGIREROBOTICS</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Gold bottom band */}
          <div style={styles.bottomBand} />
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
