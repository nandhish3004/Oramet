const fs = require('fs');
const path = require('path');

const W = 430;
const H = 932;
const C = { bg: '#F7F4EE', card: '#FFFFFF', ink: '#1F1A17', muted: '#716A64', line: '#E7E0D8', brand: '#8C5338', brand2: '#B46A45', pale: '#F5ECE6', blue: '#166D94', bluePale: '#E8F3F7', amber: '#8A5600', amberPale: '#FFF4DF', red: '#A63E37', redPale: '#FCEDEA', green: '#34705B', greenPale: '#E7F2EC' };
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rect = (x,y,w,h,fill=C.card,r=16,stroke='none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const line = (x1,y1,x2,y2,color=C.line,width=1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const txt = (x,y,s,size=14,color=C.ink,weight=500,anchor='start') => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${e(s)}</text>`;
const pill = (x,y,w,label,fill=C.pale,color=C.brand) => `${rect(x,y,w,28,fill,14)}${txt(x+w/2,y+19,label,10,color,700,'middle')}`;
const cardTitle = (x,y,title,sub='') => `${txt(x,y,title,16,C.ink,700)}${sub?txt(x,y+19,sub,11,C.muted,400):''}`;
const button = (y,label,secondary=false) => `${rect(24,y,382,50,secondary?C.pale:C.brand,14)}${txt(215,y+31,label,14,secondary?C.brand:'#FFFFFF',700,'middle')}`;
const header = (title,subtitle='') => `${txt(27,52,'9:41',12,C.ink,700)}${txt(403,52,'●  ◔  ▰',11,C.ink,600,'end')}${line(0,66,430,66)}${txt(24,105,title,22,C.ink,800)}${subtitle?txt(24,127,subtitle,11,C.muted,400):''}`;
const nav = (active='Home') => `${rect(15,842,400,58,'#FFFFFF',22,C.line)}${['Home','Alerts','Map','Profile'].map((n,i)=>{const x=65+i*100;const on=n===active;return `${txt(x,867,['⌂','!','⌖','○'][i],17,on?C.brand:C.muted,700,'middle')}${txt(x,887,n,9,on?C.brand:C.muted,on?700:500,'middle')}`}).join('')}`;
const previewFooter = () => `${line(24,909,406,909,C.line)}${txt(215,925,'ILLUSTRATIVE UI PREVIEW · NOT A DEVICE CAPTURE',8,C.muted,700,'middle')}`;
const badge = (x,y,label,fill=C.amberPale,color=C.amber) => `${rect(x,y, label.length*6.1+18,22,fill,11)}${txt(x+9,y+15,label,9,color,700)}`;
function svg(content){return `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="1864" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.bg}"/>${content}${previewFooter()}</svg>`;}

const screens = [
['01_welcome.png', [
  `${txt(215,170,'ORAMET',34,C.brand,800,'middle')}${txt(215,196,'Local weather and emergency guidance',12,C.muted,500,'middle')}`,
  `${rect(24,238,382,205,C.pale,24)}${txt(215,315,'LOCAL CONTEXT',11,C.brand,800,'middle')}${txt(215,351,'Weather · places ·',22,C.ink,700,'middle')}${txt(215,380,'emergency actions',22,C.ink,700,'middle')}${txt(215,411,'Prototype for SIH 2026 · PS 26192',11,C.muted,500,'middle')}`,
  `${rect(24,476,382,92,C.amberPale,15)}${txt(42,505,'Prototype limitation',13,C.amber,800)}${txt(42,528,'Official hazard feeds and dispatch are not connected.',10,C.ink,500)}${txt(42,546,'Do not use as your sole emergency source.',10,C.ink,500)}`,
  button(603,'Continue as guest'), button(666,'Sign in',true),
  `${txt(215,756,'Call 112 in India for immediate assistance.',11,C.muted,500,'middle')}`
].join('')],
['02_login.png', [
  header('Sign in','Local prototype account flow'),
  `${rect(24,158,382,66,C.bluePale,14)}${txt(42,184,'Provider verification is not configured.',12,C.blue,700)}${txt(42,204,'Do not treat this screen as verified identity.',10,C.muted,500)}`,
  `${cardTitle(30,274,'Email address')}${rect(24,291,382,50,'#FFFFFF',12,C.line)}${txt(42,322,'name@example.com',13,C.muted,400)}`,
  `${cardTitle(30,386,'Password')}${rect(24,403,382,50,'#FFFFFF',12,C.line)}${txt(42,434,'Enter password',13,C.muted,400)}`,
  button(486,'Continue'), `${txt(215,571,'or',11,C.muted,500,'middle')}`,
  `${rect(24,596,382,50,'#FFFFFF',12,C.line)}${txt(215,627,'Google sign-in unavailable · OAuth not configured',11,C.muted,600,'middle')}`,
  `${txt(215,704,'No SMS or OTP provider is configured.',11,C.muted,500,'middle')}`,
  `${txt(215,763,'Continue as guest',13,C.brand,700,'middle')}`
].join('')],
['03_dashboard.png', [
  header('Weather & safety status','Selected area · approximate'),
  `${rect(18,145,394,64,C.amberPale,12)}${txt(32,169,'PROTOTYPE ONLY',10,C.amber,800)}${txt(32,190,'Official hazard feeds are not connected.',11,C.ink,600)}`,
  `${rect(24,226,382,76,'#FFFFFF',15,C.line)}${txt(42,252,'LOCATION',10,C.brand,800)}${txt(42,277,'Choose precise device location',14,C.ink,700)}${badge(291,244,'APPROXIMATE')}`,
  `${rect(24,320,382,98,C.card,16,C.line)}${txt(42,348,'CURRENT WEATHER',10,C.blue,800)}${txt(42,377,'Unavailable',22,C.ink,800)}${txt(42,399,'No valid live response received',10,C.muted,500)}`,
  `${rect(24,436,184,98,C.card,14,C.line)}${txt(40,463,'RIVER GAUGE',10,C.muted,700)}${txt(40,493,'Not connected',14,C.ink,700)}${rect(222,436,184,98,C.card,14,C.line)}${txt(238,463,'SHELTER STATUS',10,C.muted,700)}${txt(238,493,'Not verified',14,C.ink,700)}`,
  `${rect(24,553,382,103,C.card,16,C.line)}${txt(42,581,'Data connections',15,C.ink,700)}${txt(42,606,'Open-Meteo · no response',11,C.muted,500)}${txt(42,629,'IMD / CWC / GSI · not connected',11,C.muted,500)}`,
  `${rect(24,678,382,80,C.brand,16)}${txt(44,710,'Emergency help',15,'#FFFFFF',800)}${txt(44,735,'Call 112 or open SOS options',11,'#F8ECE5',500)}`,
  nav('Home')
].join('')],
['04_risk_status.png', [
  header('Safety breakdown','Selected area · approximate'),
  `${rect(24,148,382,205,C.card,20,C.line)}${txt(215,195,'RISK STATUS',11,C.muted,800,'middle')}${txt(215,260,'—',64,C.muted,700,'middle')}${txt(215,295,'DATA UNAVAILABLE',13,C.muted,800,'middle')}${txt(215,327,'No validated hazard feeds connected',10,C.muted,500,'middle')}`,
  `${rect(24,378,382,137,C.amberPale,16)}${txt(42,408,'Lead-time forecast unavailable',15,C.amber,800)}${txt(42,435,'No authorized river-gauge or catchment',11,C.ink,500)}${txt(42,454,'forecast is connected. No flood-crest time',11,C.ink,500)}${txt(42,473,'or safe route is calculated.',11,C.ink,500)}`,
  `${rect(24,538,382,196,C.card,16,C.line)}${txt(42,570,'Official data connections',15,C.ink,700)}${txt(42,601,'IMD observations     Not connected',11,C.muted,500)}${txt(42,631,'CWC river gauges     Not connected',11,C.muted,500)}${txt(42,661,'GSI / road status     Not connected',11,C.muted,500)}${txt(42,706,'Check official local advisories.',10,C.brand,700)}`,
  nav()
].join('')],
['05_map_places.png', [
  header('Nearby mapped places','Map search requires precise location'),
  `${rect(24,148,382,326,'#E7ECE8',18,C.line)}${[0,1,2,3,4].map(i=>line(40,185+i*54,390,185+i*54,'#D1D8D2',1)).join('')}${[0,1,2,3,4].map(i=>line(45+i*75,166,45+i*75,455,'#D1D8D2',1)).join('')}${txt(215,292,'Map preview',19,C.muted,700,'middle')}${txt(215,321,'No route is drawn or certified.',11,C.muted,500,'middle')}`,
  `${rect(24,496,382,116,C.amberPale,15)}${txt(42,527,'Precise location required',15,C.amber,800)}${txt(42,552,'Approximate area points are withheld from',11,C.ink,500)}${txt(42,572,'nearby search and sharing.',11,C.ink,500)}`,
  `${rect(24,633,382,96,C.card,15,C.line)}${txt(42,665,'Map data notice',14,C.ink,700)}${txt(42,689,'Mapped places are not verified safe or open.',10,C.muted,500)}${txt(42,708,'Map directions are not hazard-aware.',10,C.muted,500)}`,
  nav('Map')
].join('')],
['06_alerts.png', [
  header('Weather advisories','Generated only from live weather responses'),
  `${rect(24,157,382,55,C.bluePale,13)}${txt(42,189,'No official alert provider is connected.',12,C.blue,700)}`,
  `${rect(24,244,382,312,C.card,20,C.line)}${txt(215,327,'No local weather advisories',17,C.ink,700,'middle')}${txt(215,356,'are currently available.',14,C.ink,600,'middle')}${txt(215,409,'This is not an all-clear. Check IMD and',11,C.muted,500,'middle')}${txt(215,430,'local emergency-service updates.',11,C.muted,500,'middle')}`,
  `${rect(24,590,382,97,C.amberPale,15)}${txt(42,621,'App thresholds are heuristic only.',13,C.amber,800)}${txt(42,646,'They do not represent an IMD warning or',10,C.ink,500)}${txt(42,665,'a validated flood-risk forecast.',10,C.ink,500)}`,
  nav('Alerts')
].join('')],
['07_sos.png', [
  header('Emergency SOS','Manual actions · no dispatch integration'),
  `${rect(24,151,382,95,C.redPale,16)}${txt(42,183,'For immediate help, call 112.',16,C.red,800)}${txt(42,211,'OraMet cannot dispatch responders.',11,C.ink,500)}`,
  `${rect(58,281,314,180,C.brand,90)}${txt(215,354,'SOS',46,'#FFFFFF',900,'middle')}${txt(215,390,'Prepare an SMS draft',14,'#FFFFFF',700,'middle')}${txt(215,421,'Review and send it yourself',11,'#F8ECE5',500,'middle')}`,
  button(493,'Call 112'), button(554,'Prepare SMS draft',true),
  `${rect(24,634,382,126,C.card,16,C.line)}${txt(42,666,'Location sharing',14,C.ink,700)}${txt(42,693,'Only precise device location can be added.',11,C.muted,500)}${txt(42,714,'Delivery is not confirmed by the app.',11,C.muted,500)}${txt(42,742,'Automatic shake detection: not configured.',10,C.red,700)}`,
  nav()
].join('')],
['08_evacuation_guidance.png', [
  header('Emergency guidance','Follow local responders and official notices'),
  `${rect(24,149,382,83,C.redPale,15)}${txt(42,180,'Call 112 in India for immediate help.',14,C.red,800)}${txt(42,204,'OraMet is not an emergency service.',11,C.ink,500)}`,
  `${rect(24,254,382,118,C.card,15,C.line)}${txt(42,287,'Avoid floodwater',16,C.ink,700)}${txt(42,315,'Do not walk or drive through moving water.',11,C.muted,500)}${txt(42,338,'Avoid closed roads and underpasses.',11,C.muted,500)}`,
  `${rect(24,394,382,135,C.card,15,C.line)}${txt(42,428,'Follow official instructions',16,C.ink,700)}${txt(42,456,'No validated river-gauge forecast or safe',11,C.muted,500)}${txt(42,478,'evacuation route is available in the app.',11,C.muted,500)}${txt(42,506,'Use local authority directions.',11,C.brand,700)}`,
  `${rect(24,550,382,115,C.amberPale,15)}${txt(42,582,'Nearby places',15,C.amber,800)}${txt(42,608,'OpenStreetMap results are not verified safe,',10,C.ink,500)}${txt(42,629,'open, or designated as shelters.',10,C.ink,500)}`,
  button(694,'Open nearby places',true), nav()
].join('')],
['09_safe_haven.png', [
  header('Nearby mapped places','OpenStreetMap · not authority-verified'),
  `${rect(24,150,382,77,C.bluePale,15)}${txt(42,181,'No designated-shelter feed connected.',14,C.blue,800)}${txt(42,204,'Mapped results may be incomplete or stale.',10,C.ink,500)}`,
  `${rect(24,247,382,147,'#E7ECE8',16,C.line)}${txt(215,310,'Place map',18,C.muted,700,'middle')}${txt(215,339,'Requires precise location + internet',11,C.muted,500,'middle')}${txt(215,366,'No safety route is calculated.',10,C.muted,500,'middle')}`,
  `${rect(24,414,382,117,C.card,15,C.line)}${txt(42,447,'Location not yet shared',14,C.ink,700)}${txt(42,473,'Check-in message opens your share sheet.',10,C.muted,500)}${txt(42,496,'OraMet cannot confirm delivery.',10,C.muted,500)}`,
  button(560,'Share check-in message'),
  `${rect(24,636,382,92,C.amberPale,15)}${txt(42,668,'Directions are not hazard-aware.',13,C.amber,800)}${txt(42,694,'Check closures and follow local responders.',10,C.ink,500)}`,
  nav('Map')
].join('')],
['10_profile_settings.png', [
  header('Profile','Local prototype preferences'),
  `${rect(24,151,382,111,C.card,17,C.line)}${rect(43,177,58,58,C.pale,29)}${txt(72,214,'O',24,C.brand,800,'middle')}${txt(119,194,'Guest profile',16,C.ink,700)}${txt(119,218,'No verified identity provider',10,C.muted,500)}${txt(119,239,'Sign-in is not production-authenticated.',9,C.muted,500)}`,
  ...[['Account','Edit profile'],['Language','App language'],['Notifications','Push not configured'],['Privacy','Location and data'],['About OraMet','SIH prototype · PS 26192']].map((it,i)=>`${rect(24,286+i*81,382,66,C.card,13,C.line)}${txt(42,315+i*81,it[0],13,C.ink,700)}${txt(42,337+i*81,it[1],10,C.muted,500)}${txt(383,326+i*81,'›',20,C.muted,600,'end')}`),
  nav('Profile')
].join('')],
['11_language_select.png', [
  header('Choose a language','Select a language for app content'),
  `${rect(24,151,382,56,C.brand,13)}${txt(42,186,'Hindi',15,'#FFFFFF',700)}${badge(321,167,'SELECTED','#FFFFFF',C.brand)}`,
  ...[['English','English'],['Tamil','Tamil language'],['Hindi','Hindi language'],['Kumaoni','Kumaoni language'],['Garhwali','Garhwali language'],['Malayalam','Malayalam language']].map((it,i)=>`${rect(24,220+i*70,382,56,C.card,13,C.line)}${txt(42,244+i*70,it[0],14,C.ink,700)}${txt(42,263+i*70,it[1],10,C.muted,500)}${txt(380,257+i*70,'○',15,C.muted,600,'end')}`),
  button(665,'Continue')
].join('')],
['12_signup.png', [
  header('Create account','Local prototype account flow'),
  `${rect(24,151,382,76,C.amberPale,14)}${txt(42,181,'Production identity provider not configured.',11,C.amber,700)}${txt(42,203,'Do not treat this as verified identity.',10,C.ink,500)}`,
  ...[['Full name','Your name'],['Email address','name@example.com'],['Password','At least 6 characters'],['Confirm password','Re-enter password']].map((it,i)=>`${txt(30,266+i*92,it[0],12,C.ink,700)}${rect(24,279+i*92,382,50,C.card,12,C.line)}${txt(42,310+i*92,it[1],12,C.muted,400)}`),
  button(681,'Create local account'), `${txt(215,763,'Guest access remains available.',11,C.brand,600,'middle')}`
].join('')],
['13_alert_detail.png', [
  header('Advisory details','Example layout · no sample alert asserted'),
  `${rect(24,151,382,72,C.bluePale,14)}${txt(42,180,'Weather advisory',14,C.blue,800)}${txt(42,202,'Only shown after a live response crosses an app threshold.',9,C.ink,500)}`,
  `${rect(24,240,382,164,C.card,16,C.line)}${txt(42,273,'Alert details',15,C.ink,700)}${txt(42,304,'Open-Meteo weather estimate',11,C.muted,500)}${txt(42,328,'This is not an official warning or river',11,C.muted,500)}${txt(42,350,'gauge observation. Check official local',11,C.muted,500)}${txt(42,372,'advisories before taking action.',11,C.muted,500)}`,
  `${rect(24,423,382,150,C.amberPale,15)}${txt(42,456,'Recommended actions',14,C.amber,800)}${txt(42,487,'• Check local authority advisories',11,C.ink,500)}${txt(42,512,'• Avoid floodwater and closed roads',11,C.ink,500)}${txt(42,537,'• Call 112 if you need urgent help',11,C.ink,500)}`,
  `${txt(215,624,'No fabricated alerts are included in this preview.',10,C.muted,500,'middle')}`,
  button(678,'Back to advisories',true), nav('Alerts')
].join('')],
['14_settings.png', [
  header('Settings','Local preferences · delivery not configured'),
  ...[['Notifications','Push is unavailable'],['Alert sound','Local preference'],['Display','Theme preference'],['Privacy','Location and data'],['Account','Sign-in provider not set']].map((it,i)=>`${rect(24,154+i*104,382,84,C.card,14,C.line)}${txt(42,185+i*104,it[0],14,C.ink,700)}${txt(42,210+i*104,it[1],10,C.muted,500)}${txt(380,202+i*104,'›',20,C.muted,600,'end')}`),
  `${rect(24,696,382,60,C.amberPale,14)}${txt(42,722,'Notification switches do not enable remote push.',10,C.amber,700)}${txt(42,741,'No push service is connected.',10,C.ink,500)}`,
  nav('Profile')
].join('')],
['15_edit_profile.png', [
  header('Edit profile','Local profile details'),
  `${rect(159,151,112,112,C.pale,56)}${txt(215,220,'O',42,C.brand,800,'middle')}${txt(215,285,'Choose avatar color',10,C.muted,500,'middle')}`,
  ...[['Full name','Guest user'],['Email address','Not provider-verified']].map((it,i)=>`${txt(30,344+i*98,it[0],12,C.ink,700)}${rect(24,358+i*98,382,54,C.card,12,C.line)}${txt(42,391+i*98,it[1],12,C.muted,400)}`),
  `${txt(215,587,'Profile changes are stored locally in this prototype.',10,C.muted,500,'middle')}`,
  button(647,'Save profile'), button(711,'Cancel',true)
].join('')],
];

const outDir = path.join(__dirname, '..', 'screenshots', 'submission_ui_preview');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, content] of screens) {
  const source = path.join(outDir, name.replace(/\.png$/, '.svg'));
  fs.writeFileSync(source, svg(content));
  console.log(source);
}
const thumbs = screens.map(([name],i)=>`<image href="${e(name)}" x="${(i%5)*180}" y="${Math.floor(i/5)*390}" width="165" height="358"/>`).join('');
const contactSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="930" height="1190" viewBox="0 0 900 1170"><rect width="900" height="1170" fill="#e9e4dc"/>${thumbs}<text x="20" y="1152" font-family="Arial" font-size="12" fill="#716a64">Illustrative app UI previews, not device screenshots. Use individual PNGs for slides.</text></svg>`;
const contactSource = path.join(outDir, '00_contact_sheet.svg');
fs.writeFileSync(contactSource, contactSvg);
