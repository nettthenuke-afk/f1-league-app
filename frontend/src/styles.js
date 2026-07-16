// ✅ styles restored (your working look)
const styles = {
page:{
  background:"#000",
  color:"white",
  minHeight:"100vh",
  padding:"16px",
  width:"100%",
  maxWidth:"500px",
  boxSizing:"border-box"
},
card: {
  position: "relative",
  padding: "60px",
  marginBottom: "16px",
  borderRadius: "12px",
  textAlign: "center",
  color: "white",
  fontWeight: "600",
  overflow: "hidden",

  background:
    "linear-gradient(90deg," +
    "#7DB9D8 0%," +
    "#7DB9D8 44%," +
    "#000000 44%," +
    "#000000 45%," +
    "#F47A20 45%," +
    "#F47A20 55%," +
    "#000000 55%," +
    "#000000 56%," +
    "#7DB9D8 56%," +
    "#7DB9D8 100%)",

  border: "2px solid #F47A20",
  boxShadow:
    "0 0 16px rgba(125,185,216,0.35)",
},

raceCard: {
background: "linear-gradient(115deg, #1f3f9a 0%, #1f3f9a 45%, #eef1f4 50%, #ffffff 54%, #dcdfe3 58%, #bfc3c8 100%)",
  border: "2px solid #ff1e1e",
  padding: "15px",
  marginBottom: "16px",
  borderRadius: "10px",
  position: "relative",
  overflow: "hidden",
  boxShadow: "none",
  outline: "1px solid #ff1e1e"
},
raceRedStripe: {
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: "6px",
  background: "#ff1e1e"
},
raceStripe: {
  position: "absolute",
  top: 0,
  left: "-40%",
  width: "180%",
  height: "100%",
  background:
    "linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 25%, rgba(255,255,255,0.05) 40%, transparent 55%)",
  transform: "skewX(-15deg)",
},
leaderboardCard:{
  background:"linear-gradient(135deg,#ff6a00,#ff8c00,#ffaa00)",
  padding:"12px",
  borderRadius:"10px",
  marginBottom:"16px",
  boxShadow:"0 4px 12px rgba(255,140,0,0.5)"
},
leaderRow:{
  background:"#111",
  padding:"10px",
  margin:"6px 0",
  borderRadius:"6px",
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center"
},
loginWrapper:{
  height:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#0b0b0b"
},

loginCard:{
  width:"90%",
  maxWidth:"340px",
  padding:"24px",
  borderRadius:"12px",
  textAlign:"center",
  background:"linear-gradient(135deg,#008C45,#F4F9FF,#CD212A)",
  boxShadow:"0 0 30px rgba(0,0,0,0.7)"
},

input:{
  width:"85%",
  padding:"10px",
  margin:"8px auto",
  display:"block",
  background:"#fff",
  color:"#000",
  border:"none",
  borderRadius:"4px"
},
loginButton: {
  width: "85%",
  maxWidth: "260px",
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  marginTop: "12px",
  background: "linear-gradient(90deg, #8b0000, #ff1e1e)",
  color: "white",
  fontWeight: "800",
  letterSpacing: "0.5px",
  cursor: "pointer",
  position: "relative",
  boxShadow: "0 4px 10px rgba(255, 0, 0, 0.5)"
},

loginButtonAccent: {
  position: "absolute",
  bottom: "0",
  left: "0",
  width: "100%",
  height: "3px",
  background: "#ffd400"
},
mainButton:{
  width:"100%",
  height: "80px",
  padding: "0",
  borderRadius:"12px",
  background:"linear-gradient(120deg,#00352f,#00a86b)",
  color:"white",
  position:"relative",
  fontSize:"16px",
  fontWeight:"900",
  marginTop:"16px",          // ✅ push it down a little more
  boxShadow:"0 4px 12px rgba(0,168,107,0.5)"
},
  stripe:{position:"absolute",left:"5%",right:"5%",bottom:"5px",height:"4px",background:"yellow"},
  btnText:{position:"relative",zIndex:1},
  tierCard:{padding:"28px 20px 20px",borderRadius:"14px",marginBottom:"22px"},
  tier1Card:{background:"linear-gradient(135deg,#0986d4,#27b0ff,#f05fb1)"},
  tier2Card:{background:"linear-gradient(135deg,#fff,#d9d9d9,#d40000)"},
  tier3Card:{background:"linear-gradient(135deg,#b8b8b8,#e0e0e0)"},
grid:{
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "10px"
},
  driverTile:{background:"#111",padding:"10px",textAlign:"center",borderRadius:"8px",color:"#fff"},
selected: {
  background: "#39ff14",   // ✅ neon green
  color: "#000",           // makes text readable
  boxShadow: "0 0 12px #39ff14"
},
mclarenButton: {
  width: "100%",
  height: "80px",
  padding: "0",
  borderRadius: "12px",
  fontWeight: "900",
  fontSize: "16px",
  letterSpacing: "0.8px",

  background: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #ff2b2b 55%, #ff0000 100%)",
  color: "#000",
  border: "2px solid #ff0000",

  boxShadow: "0 0 16px rgba(255,0,0,0.7)",
  cursor: "pointer",

  marginTop: "16px",
  position: "relative"
},

taken:{opacity:.4},
driverName:{fontWeight:"bold"},
driverTeam:{fontSize:"11px"},
takenText:{fontSize:"10px"},

backButton: {
  width: "100%",
  height: "80px",
  border: "none",
  borderRadius: "14px",
  marginTop: "12px",
  fontSize: "18px",
  fontWeight: "800",
  cursor: "pointer",
  color: "#111",
  background:
    "linear-gradient(180deg, #FFD21A 0%, #E6B800 100%)",
  boxShadow:
    "0 0 18px rgba(255,212,0,0.4)",
  position: "relative",
  overflow: "hidden",
  letterSpacing: "0.5px",
},

mclarenStripe: {
  position: "absolute",
  left: "5%",
  right: "5%",
  bottom: "6px",
  height: "5px",
  background: "#ffd400",
  borderRadius: "2px"
},

sennaStripeTop: {
  position: "absolute",
  top: "8px",
  left: 0,
  width: "100%",
  height: "7px",
  background:
    "linear-gradient(to bottom, #002776 0px, #002776 1px, #009C3B 1px, #009C3B 6px, #002776 6px, #002776 7px)",
},

sennaStripeBottom: {
  position: "absolute",
  bottom: "8px",
  left: 0,
  width: "100%",
  height: "7px",
  background:
    "linear-gradient(to bottom, #009C3B 0px, #009C3B 1px, #002776 1px, #002776 6px, #009C3B 6px, #009C3B 7px)",
},

gulfTitle: {
  fontSize: "32px",
  fontWeight: "900",
  letterSpacing: "1px",
  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
},

gulfUser: {
  marginTop: "8px",
  fontSize: "18px",
  fontWeight: "600",
  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
},

gulfRoundel: {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  fontWeight: "900",
  color: "#111",
  boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
  zIndex: 5,
},

leftPanel: {
  position: "absolute",
  left: "25px",
  top: "50%",
  transform: "translateY(-50%)",

  fontSize: "20px",
  fontWeight: "800",

  color: "white",
  textShadow: "0 2px 4px rgba(0,0,0,0.6)",
},

rightPanel: {
  position: "absolute",
  right: "25px",
  top: "50%",
  transform: "translateY(-50%)",

  fontSize: "20px",
  fontWeight: "700",

  color: "white",
  textShadow: "0 2px 4px rgba(0,0,0,0.6)",
},

raceCar: {
  fontSize: "28px",
  marginLeft: "8px",
  display: "inline-block",
  transform: "translateY(2px)",
},

// ===== STATS PAGE =====

statsPage: {
  background: "#000",
  minHeight: "100vh",
  padding: "20px",
  color: "white",
},

statsHeader: {
  background: "linear-gradient(180deg, #e10600 0%, #c00000 100%)",
  color: "#ffffff",
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontSize: "clamp(24px, 6vw, 48px)",
  fontWeight: "900",
  textAlign: "center",
  padding: "26px",
  border: "4px solid #111111",
  boxShadow:
    "inset 0 0 0 2px #ffffff, 0 0 12px rgba(225,6,0,0.35)",
  borderRadius: "8px",
  textTransform: "uppercase",
  letterSpacing: "2px",
  marginBottom: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "80px",
},

statsHeaderIcon: {
  background: "#ffffff",
  color: "#111111",
  borderRadius: "50%",
  border: "2px solid #111111",
},

statsHeaderBadge: {
  height: "60px",
  width: "auto",
},

// ===== HALL OF CHAMPIONS =====

hallOfChampionsCard: {
  background: "#000",
  border: "5px solid #e3c55a",
  boxShadow: "0 0 20px rgba(227,197,90,0.35)",
  borderRadius: "12px",
  paddingTop: "34px",
  paddingBottom: "24px",
  paddingLeft: "20px",
  paddingRight: "20px",
  marginBottom: "16px",
  position: "relative",
  overflow: "hidden",
},

hallOfChampionsTitle: {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(24px, 6vw, 48px)",
  fontWeight: "700",
  lineHeight: "1.2",
  paddingTop: "15px",
  background:
    "linear-gradient(180deg, #f7e083 0%, #e0c04d 30%, #caa43b 60%, #f0d76a 100%)",

  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",

  textAlign: "center",

  marginBottom: "35px",
},

hallOfChampionsList: {
  color: "#ffffff",
  fontSize: "24px",
  lineHeight: "1.8",
},

jpsStripeTop: {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "6px",

  background:
    "linear-gradient(90deg, #8b6a00 0%, #f4dc7a 45%, #fff2b8 50%, #f4dc7a 55%, #8b6a00 100%)",
},

jpsStripeBottom: {
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "6px",
  background:
    "linear-gradient(90deg, #8b6a00 0%, #f4dc7a 45%, #fff2b8 50%, #f4dc7a 55%, #8b6a00 100%)",
},

championRow: {
  color: "#e3c55a",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "34px",
  marginBottom: "24px",
  padding: "18px",
  border: "4px solid #caa43b",
  background: "rgba(227,197,90,0.04)",
  borderRadius: "6px",
},

// ===== WEEKLY WINS =====

weeklyWinsCard: {
  background: "linear-gradient(120deg, #31c74a 0%, #31c74a 49.3%, #ffffff 49.85%, #ffffff 50.15%, #74c2ff 50.7%, #74c2ff 100%)",
  border: "3px solid #ffffff",
  borderTop: "3px solid #ff7a00",
  borderRadius: "12px",
  padding: "18px",
  paddingTop: "28px",
  marginBottom: "16px",
  boxShadow: "0 0 15px rgba(41,194,74,0.35)",
  overflow: "hidden",
},

weeklyWinsTitle: {
  color: "#ffffff",
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontSize: "clamp(24px, 6vw, 48px)",
  fontWeight: "900",
  textAlign: "center",
  textTransform: "uppercase",
  textShadow: "none",
},

weeklyWinsDivider: {
  height: "10px",
  background: "#0047b3",
  border: "2px solid #ffffff",
  borderRadius: "6px",
  marginTop: "12px",
  marginBottom: "24px",
},

weeklyWinsRow: {
  background: "linear-gradient(180deg, #0057d6 0%, #0047b3 45%, #003da0 100%)",
  color: "#ffffff",
  border: "2px solid #ffffff",
  borderRadius: "8px",
  padding: "12px",
  marginBottom: "12px",
  textAlign: "center",
  fontWeight: "700",
  boxShadow: "0 0 4px rgba(255,255,255,0.15)",
  width: "50%",
  margin: "0 auto 12px auto",
},

// ===== WEEKLY LAST PLACE =====

weeklyLastPlaceCard: {
background: "linear-gradient(135deg, #ff7a00 0%, #ff7a00 24%, #f4f4f4 32%, #f4f4f4 68%, #20a246 76%, #20a246 100%)",
  borderRadius: "10px",
  padding: "30px",
  marginBottom: "16px",
  overflow: "hidden",
  boxShadow:
    "inset 0 8px 0 #ff7a00, " +
    "inset 0 -8px 0 #20a246, " +
    "0 0 12px rgba(245,130,32,0.25)",
  border: "1px solid #ffffff",
},

weeklyLastPlaceTitle: {
  color: "#111111",
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontSize: "clamp(24px, 6vw, 48px)",
  fontWeight: "900",
  textAlign: "center",
  letterSpacing: "2px",
  textTransform: "uppercase",
  textShadow: "none",
  WebkitTextStroke: "0px",
  marginBottom: "40px",
},

weeklyLastPlaceRow: {
  color: "#111111",
  fontSize: "20px",
  fontWeight: "600",
  textAlign: "center",
  marginBottom: "20px",
},

// ===== LIFETIME STANDINGS =====

lifetimeStandingsCard: {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "38px",
  marginBottom: "16px",
  border: "6px solid #1f4ea8",
  boxShadow:
    "inset 0 8px 0 #1f4ea8, \
     inset 0 16px 0 #6ec6ff, \
     inset 0 24px 0 #e63946",
  overflow: "hidden",
  position: "relative",
},

lifetimeStandingsTitle: {
  color: "#111111",
  fontFamily: "'Trebuchet MS', Arial, sans-serif",
  fontSize: "clamp(24px, 6vw, 48px)",
  fontWeight: "900",
  textAlign: "center",
  letterSpacing: "1px",
  textTransform: "uppercase",
  marginBottom: "16px",
},

lifetimeStandingsRow: {
  background: "linear-gradient(90deg, rgba(31,78,168,0.13) 0%, rgba(110,198,255,0.13) 30%, #ffffff 45%, rgba(230,57,70,0.16) 70%, rgba(230,57,70,0.22) 100%)",
  borderLeft: "4px solid #1f4ea8", borderRight: "4px solid #e63946",
  borderRadius: "6px",
  padding: "10px",
  marginTop: "10px",
  marginBottom: "10px",
  color: "#111111",
},

lifetimeStandingsDivider: {
  height: "8px",
  background:
    "linear-gradient(90deg, #1f4ea8 0%, #1f4ea8 45%, #6ec6ff 45%, #6ec6ff 75%, #e63946 75%, #e63946 100%)",
  borderRadius: "4px",
  marginBottom: "28px",
},

// ===== ZERO POINT WEEKS =====

zeroPointWeeksCard: {
  background: "linear-gradient(180deg, #faf8f2 0%, #f4f0e8 50%, #faf8f2 100%)",
  border: "8px solid #8b1e3f",
  borderRadius: "12px",
  padding: "18px",
  marginBottom: "16px",
  position: "relative",
  boxShadow:
    "inset 0 0 0 6px #c5a44b, 0 0 12px rgba(139,30,63,0.35)",
},

zeroPointWeeksTitle: {
  color: "#d0af57",
  fontFamily: "'Segoe UI', sans-serif",
  fontSize: "clamp(24px, 6vw, 48px)",
  fontWeight: "900",
  textAlign: "center",
  textShadow: "none",
  letterSpacing: "0px",
  paddingTop: "10px",
  paddingBottom: "10px",
  textShadow: "0 0 3px rgba(208,175,87,0.35)",
},

zeroPointWeeksRow: {
  background:
    "linear-gradient(180deg, #f7f2e8 0%, #ece4d7 100%)",
  borderLeft: "12px solid #c5a44b",
  borderRight: "12px solid #8b1e3f",
  color: "#111",
  borderRadius: "18px",
  padding: "10px",
  marginBottom: "12px",
},

// ===== STATS LISTS =====

statsList: {
  maxWidth: "300px",
  margin: "0 auto",
  textAlign: "left",
  lineHeight: "1.8",
  fontSize: "28px",
  color: "white",
},

// ===== RETURN BUTTON =====

statsButton: {
  width: "100%",
  padding: "18px",
  fontSize: "32px",
  fontWeight: "900",
  color: "#ffffff",
  background: "linear-gradient(180deg, #c8c8c8 0%, #b8b8b8 15%, #e3e3e3 35%, #b0b0b0 50%, #e6e6e6 65%, #b5b5b5 85%, #c8c8c8 100%)",  border: "6px solid #ff5000",
  borderRadius: "14px",
  cursor: "pointer",
  boxShadow:
    "0 0 24px rgba(255,128,0,0.65), 0 0 10px rgba(255,255,255,0.40)",
  transition: "all 0.2s ease",
  textShadow:
    "0 0 8px rgba(0,0,0,0.8)",
},

statsButtonText: {
  display: "inline-block",
  padding: "8px 28px",
  background: "linear-gradient(180deg, #ff4d00 0%, #ff5000 40%, #ff4500 60%, #ff6a00 100%)",
  border: "2px solid #000",
  borderRadius: "999px",
  paddingLeft: "65px",
  paddingRight: "55px",
  borderRadius: "999px",
  paddingTop: "8px",
  paddingBottom: "8px",
  color: "#ffffff",
  fontWeight: "900",
  boxShadow:
    "inset 0 2px 0 rgba(255,255,255,0.25) 0 0 15px rgba(255,80,0,0.8)"
},

// ====== DRIVER HISTORY ======
driverHistoryCard: {
  background: "#F4C300",
  border: "5px solid #1E4E9D",
  borderRadius: "20px",
  width: "85%",
  maxWidth: "900px",
  margin: "0 auto",
  padding: "25px",
  boxShadow: "0 0 25px rgba(244,195,0,.45)",
  backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,.15), rgba(255,255,255,0))",
},

driverHistoryTitle: {
  color: "#123A7A",
  fontFamily: "Georgia, serif",
  fontWeight: "900",
  fontStyle: "normal",
  letterSpacing: "3px",
  textTransform: "uppercase",
  textAlign: "center",
  fontSize: "clamp(36px, 6vw, 64px)",
  marginBottom: "25px",
  fontSize: "clamp(20px, 4vw, 38px)",
  whiteSpace: "normal",
  overflowWrap: "break-work",
  lineHeight: "1.1",
  width: "90%",
  maxWidth: "90%",
},

driverHistoryRow: {
  display: "grid",
  gridTemplateColumns: "40px 1fr auto",
  gap: "10px",
  alignItems: "center",
  padding: "12px",
  marginBottom: "8px",
  background: "#F7D74A",
  borderRadius: "10px",
  border: "2px solid #123A7A",
},

driverHistoryRank: {
  color: "#123A7A",
  fontWeight: "900",
  fontSize: "18px",
},

driverHistoryDriver: {
  color: "#123A7A",
  fontWeight: "900",
  fontSize: "18px",
},

driverHistoryStats: {
  color: "#123A7A",
  fontWeight: "900",
  whiteSpace: "nowrap",
  textAlign: "right",
  fontSize: "0.82rem",
},

driverHistoryPercentage: {
  color: "#123A7A",
  fontWeight: "900",
  whiteSpace: "nowrap",
},

driverHistoryButton: {
  width: "100%",
  maxWidth: "500px",
  padding: "18px 24px 18px 100px",
  marginTop: "16px",
  borderRadius: "14px",
  border: "3px solid #ffffff",
  background:
    "linear-gradient(90deg,#ffffff 0%,#ffffff 14%,#ffe600 14%,#ffe600 22%,#ff2c2c 22%,#ff2c2c 30%,#111111 30%,#111111 38%,#ffffff 38%,#ffffff 100%)",
  color: "#111111",
  fontWeight: "900",
  fontSize: "22px",
  textAlign: "right",
  letterSpacing: "1px",
  textTransform: "uppercase",
  cursor: "pointer",
},

//===== OWNER HISTORY BUTTON ======
ownerHistoryButton: {
  position: "relative",
  width: "100%",
  maxWidth: "500px",
  height: "110px",
  background: "#050505",
  border: "3px solid #777",
  borderRadius: "16px",
  cursor: "pointer",
  overflow: "hidden",
  marginTop: "20px",
  boxShadow: "0 0 0 1px #222, 0 6px 14px rgba(0,0,0,0.45)",
},

ownerHistoryStripeRed: {
  position: "absolute",
  top: "28px",
  left: 0,
  width: "34%",
  height: "12px",
  background: "#E10600",
},

ownerHistoryStripeRedRight: {
  position: "absolute",
  top: "28px",
  right: 0,
  width: "34%",
  height: "12px",
  background: "#E10600",
},

ownerHistoryStripeBlue: {
  position: "absolute",
  top: "49px",
  left: 0,
  width: "34%",
  height: "12px",
  background: "#0057D9",
},

ownerHistoryStripeBlueRight: {
  position: "absolute",
  top: "49px",
  right: 0,
  width: "34%",
  height: "12px",
  background: "#0057D9",
},

ownerHistoryStripeYellow: {
  position: "absolute",
  top: "70px",
  left: 0,
  width: "34%",
  height: "12px",
  background: "#F7C600",
},

ownerHistoryStripeYellowRight: {
  position: "absolute",
  top: "70px",
  right: 0,
  width: "34%",
  height: "12px",
  background: "#F7C600",
},

ownerHistoryButtonText: {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "#FFFFFF",
  fontSize: "21px",
  fontWeight: "800",
  textAlign: "center",
  lineHeight: "0.9",
  letterSpacing: "1px",
  textTransform: "uppercase",
  zIndex: 5,
  background: "#050505",
  padding: "0 10px",
},

};

export default styles;