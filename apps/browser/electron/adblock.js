import fs from 'fs'
import path from 'path'
import https from 'https'

// Core list: top ad networks / trackers for immediate offline blocking
const CORE_DOMAINS = new Set([
  // Google Ads
  'doubleclick.net','googlesyndication.com','googleadservices.com',
  'adservice.google.com','pagead2.googlesyndication.com','tpc.googlesyndication.com',
  'google-analytics.com','ssl.google-analytics.com','analytics.google.com',
  'stats.g.doubleclick.net','googletagmanager.com','2mdn.net',
  // Meta
  'connect.facebook.net','an.facebook.com','pixel.facebook.com',
  // Amazon Ads
  'amazon-adsystem.com','fls-na.amazon.com','fls-eu.amazon.com','assoc-amazon.com',
  // AppNexus / Xandr
  'adnxs.com','ib.adnxs.com','secure.adnxs.com',
  // Criteo
  'criteo.com','criteo.net','criteo.us',
  // Rubicon
  'rubiconproject.com',
  // PubMatic
  'pubmatic.com',
  // OpenX
  'openx.net','openx.com',
  // Index Exchange
  'casalemedia.com','indexexchange.com',
  // The Trade Desk
  'adsrvr.org',
  // AdRoll
  'adroll.com',
  // Taboola
  'taboola.com','trc.taboola.com',
  // Outbrain
  'outbrain.com','outbrainimg.com','zemanta.com',
  // Sharethrough
  'sharethrough.com','sharethroughads.com',
  // Verizon / Oath / Yahoo
  'advertising.com','adtech.com','ads.yahoo.com','ads.yimg.com',
  // Moat
  'moatads.com','moat.com',
  // Smart (Equativ)
  'smartadserver.com','equativ.com',
  // Sovrn
  'lijit.com','sovrn.com',
  // Sizmek / Flashtalking
  'sizmek.com','flashtalking.com',
  // MediaPlex
  'mediaplex.com',
  // Undertone
  'undertone.com','undertoneads.com',
  // Conversant
  'conversantmedia.com','conversant.com',
  // BidSwitch
  'bidswitch.net','bidswitch.com',
  // Exponential
  'exponential.com','tribal-fusion.com',
  // Revcontent
  'revcontent.com',
  // SpotX
  'spotxchange.com','spotx.tv',
  // Yieldlab
  'yieldlab.net','yieldlab.com',
  // AdForm
  'adform.net','adform.com',
  // Carbon Ads
  'carbonads.net','carbonads.com',
  // BuySellAds
  'buysellads.com','buysellads.net',
  // Fyber
  'fyber.com',
  // SpringServe
  'springserve.com','springserve.net',
  // MediaMath
  'mathtag.com',
  // Turn
  'turn.com',
  // Kargo
  'kargo.com',
  // GumGum
  'gumgum.com',
  // Vidazoo
  'vidazoo.com',
  // Yandex Ads
  'an.yandex.ru','advertising.yandex.ru','adfox.ru','adfox.yandex.ru',
  // Microsoft Ads
  'bat.bing.com','ads.microsoft.com',
  // LinkedIn Ads
  'ads.linkedin.com',
  // Twitter/X Ads
  'ads-twitter.com','static.ads-twitter.com',
  // TikTok
  'tracking.tiktok.com','analytics.tiktok.com','ads.tiktok.com',
  // Snapchat
  'tr.snapchat.com',
  // Pinterest
  'ct.pinterest.com','ads.pinterest.com',
  // Reddit Ads
  'ads.reddit.com',
  // Analytics & Tracking
  'quantserve.com','quantcast.com',
  'scorecardresearch.com',
  'omtrdc.net','omniture.com',
  'demdex.net',
  'bluekai.com',
  'krxd.net',
  'mxpnl.com','mixpanel.com',
  'segment.com','segment.io',
  'hotjar.com',
  'fullstory.com',
  'logrocket.com',
  'mouseflow.com',
  'luckyorange.com',
  'crazyegg.com',
  'optimizely.com',
  'vwo.com',
  'abtasty.com',
  'chartbeat.com','chartbeat.net',
  'newrelic.com','nr-data.net',
  'clarity.ms',
  'mc.yandex.ru',
  'addthis.com','clearspring.com',
  'sharethis.com',
  'rlcdn.com',
  'rfihub.net','rfihub.com',
  'ml314.com',
  'doubleverify.com','cdn.doubleverify.com',
  'adzerk.net','adzerk.com',
  // Popup / redirect networks
  'popcash.net','popads.net','popunder.net',
  'trafficfactory.biz','trafficholder.com',
  'trafficjunky.net','trafficjunky.com',
  // Fingerprinting (commercial)
  'fingerprintjs.com',
  // Contextual / native ads
  'zergnet.com',
  'contextly.com',
  'mgid.com',
  'engageya.com',
  'around.io',
])

let blockSet = new Set(CORE_DOMAINS)
let enabled = true
let blockedCount = 0

export function isEnabled() { return enabled }
export function setEnabled(v) { enabled = !!v }
export function getBlockedCount() { return blockedCount }
export function resetCount() { blockedCount = 0 }
export function getDomainCount() { return blockSet.size }

export function shouldBlock(url) {
  if (!enabled) return false
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    const parts = hostname.split('.')
    for (let i = 0; i < parts.length - 1; i++) {
      if (blockSet.has(parts.slice(i).join('.'))) {
        blockedCount++
        return true
      }
    }
  } catch {}
  return false
}

export async function loadBlocklist(userDataPath) {
  const cachePath = path.join(userDataPath, 'adblock-cache.txt')
  try {
    if (fs.existsSync(cachePath)) {
      const lines = fs.readFileSync(cachePath, 'utf8').split('\n')
      const loaded = new Set(CORE_DOMAINS)
      for (const line of lines) {
        if (line) loaded.add(line)
      }
      blockSet = loaded
      console.log(`[adblock] Loaded ${blockSet.size.toLocaleString()} domains from cache`)
    }
  } catch (e) {
    console.warn('[adblock] Cache load failed, using core list')
  }
  // Update cache in the background
  fetchHostsList(cachePath)
}

function fetchHostsList(cachePath) {
  const url = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts'
  https.get(url, { headers: { 'User-Agent': 'CascadeBrowser/1.0' } }, (res) => {
    if (res.statusCode !== 200) return
    let data = ''
    res.on('data', chunk => { data += chunk })
    res.on('end', () => {
      try {
        const domains = parseHostsFile(data)
        const merged = new Set([...CORE_DOMAINS, ...domains])
        blockSet = merged
        fs.writeFileSync(cachePath, domains.join('\n'))
        console.log(`[adblock] Updated blocklist: ${merged.size.toLocaleString()} domains`)
      } catch (e) {
        console.warn('[adblock] Failed to parse hosts list:', e.message)
      }
    })
  }).on('error', (e) => {
    console.warn('[adblock] Failed to fetch hosts list:', e.message)
  })
}

function parseHostsFile(text) {
  const domains = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const parts = line.split(/\s+/)
    if ((parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1') && parts[1]) {
      const domain = parts[1].toLowerCase()
      if (domain !== '0.0.0.0' && domain !== 'localhost' && domain !== 'local' && !domain.includes('#')) {
        domains.push(domain)
      }
    }
  }
  return domains
}

// Cosmetic CSS injected into every page to hide common ad containers
export const AD_CSS = `
  ins.adsbygoogle, .adsbygoogle,
  [id*="google_ads_iframe"], [id^="div-gpt-ad"], [id^="google_ads"],
  [class*="GoogleAd"], [class*="google-ad"],
  [id*="taboola"]:not(body):not(html),
  [class*="taboola-"]:not(body):not(html),
  [id*="outbrain"]:not(body):not(html),
  [class*="outbrain"]:not(body):not(html),
  #carbonads, .carbonads, .carbon-ads,
  [data-ad-slot]:not(body):not(html),
  [data-ad-unit]:not(body):not(html),
  [aria-label="advertisement"],
  [aria-label="Advertisement"],
  [class*="sponsored-content__"],
  [id*="sponsor_"]:not(body):not(html),
  [class*="widget-advertise"]:not(body):not(html),
  iframe[src*="doubleclick.net"],
  iframe[src*="googlesyndication.com"],
  iframe[src*="adnxs.com"],
  iframe[src*="taboola.com"],
  iframe[src*="outbrain.com"] {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
    height: 0 !important;
    overflow: hidden !important;
  }
`
