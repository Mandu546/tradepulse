import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useThemeStore from '../../store/themeStore'
import styles from './LandingPage.module.css'

const MARKETS = [
  { sym: 'R_75',     val: '8,431.45', chg: '+0.15%', up: true  },
  { sym: 'R_100',    val: '1,024.82', chg: '-0.08%', up: false },
  { sym: 'R_50',     val: '4,218.67', chg: '+0.22%', up: true  },
  { sym: '1HZ100V',  val: '9,871.33', chg: '+0.31%', up: true  },
  { sym: 'R_25',     val: '2,103.44', chg: '-0.05%', up: false },
  { sym: '1HZ75V',   val: '7,652.19', chg: '+0.18%', up: true  },
  { sym: 'BOOM1000', val: '3,201.88', chg: '+0.44%', up: true  },
  { sym: 'CRASH500', val: '1,887.55', chg: '-0.29%', up: false },
]

const FEATURES = [
  { icon: '📈', title: 'Live Charts',     desc: 'Real-time candlestick charts with tick-by-tick precision on all Deriv markets.' },
  { icon: '🤖', title: 'Bot Builder',     desc: 'Build automated strategies visually. Martingale, D\'Alembert, custom logic — no code needed.' },
  { icon: '⚡', title: 'Manual Trading',  desc: 'One-tap execution of Rise/Fall, Digits, Multipliers and more with full parameter control.' },
  { icon: '📊', title: 'Analytics',       desc: 'Track win rate, P&L, trade history and performance metrics across all your strategies.' },
  { icon: '👥', title: 'Copy Trading',    desc: 'Mirror top traders automatically. Set your stake size, sit back and let Dopra trade for you.' },
  { icon: '🔒', title: 'Secure & Fast',   desc: 'OAuth2 Deriv login. No passwords stored. Your funds stay fully under your control.' },
]

function PulseOrb() {
  return (
    <div className={styles.orbWrap} aria-hidden="true">
      <div className={styles.orbOuter}>
        <div className={styles.orbMid}>
          <div className={styles.orbInner} />
        </div>
      </div>
      <div className={styles.orbRing1} />
      <div className={styles.orbRing2} />
    </div>
  )
}

function LivePriceCard() {
  const [price, setPrice] = useState(8431.45)
  const [up, setUp] = useState(true)
  const [change, setChange] = useState('+12.30')

  useEffect(() => {
    const id = setInterval(() => {
      setPrice(prev => {
        const delta = (Math.random() - 0.48) * 3
        const next = parseFloat((prev + delta).toFixed(2))
        setUp(delta >= 0)
        setChange((delta >= 0 ? '+' : '') + delta.toFixed(2))
        return next
      })
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.priceCard}>
      <div className={styles.priceHeader}>
        <span className={styles.priceSym}>Volatility 75 Index</span>
        <span className={`${styles.priceBadge} ${styles.live}`}>● LIVE</span>
      </div>
      <div className={styles.priceBig}>{price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      <div className={`${styles.priceChange} ${up ? styles.up : styles.dn}`}>
        {up ? '▲' : '▼'} {change} ({(Math.abs(parseFloat(change)) / price * 100).toFixed(2)}%)
      </div>
      <div className={styles.priceBtns}>
        <button className={styles.buyBtn}>▲ Rise</button>
        <button className={styles.sellBtn}>▼ Fall</button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useThemeStore()
  const tickerRef = useRef(null)

  return (
    <div className={styles.page}>

      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <span />
            </div>
            <span className={styles.logoText}>Dopra</span>
          </div>

          <ul className={styles.navLinks}>
            <li><a href="#features">Features</a></li>
            <li><a href="#modes">How it works</a></li>
            <li><a href="#markets">Markets</a></li>
          </ul>

          <div className={styles.navRight}>
            <button
              className={styles.themeBtn}
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className={styles.loginBtn} onClick={() => navigate('/dashboard')}>
              Log in
            </button>
            <button className={styles.ctaBtn} onClick={() => navigate('/dashboard')}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <div className={styles.ticker} aria-label="Live market prices">
        <div className={styles.tickerInner} ref={tickerRef}>
          {[...MARKETS, ...MARKETS].map((m, i) => (
            <span key={i} className={styles.tickItem}>
              <span className={styles.tickSym}>{m.sym}</span>
              <span className={styles.tickVal}>{m.val}</span>
              <span className={m.up ? styles.tickUp : styles.tickDn}>
                {m.up ? '▲' : '▼'} {m.chg}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>

            <div className={styles.heroLeft}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Built on Deriv · Real markets · Real money
              </div>

              <h1>
                Trade on instinct.<br />
                <span className={styles.accentText}>Automate</span> the rest.
              </h1>

              <p className={styles.heroSub}>
                Dopra is your all-in-one trading terminal — manual precision and automated bot strategies, running together on live Deriv markets.
              </p>

              <div className={styles.heroBtns}>
                <button className={styles.ctaBtn} onClick={() => navigate('/dashboard')}>
                  Start trading free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button className={styles.ghostBtn} onClick={() => navigate('/bot-builder')}>
                  See bot builder
                </button>
              </div>

              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <span className={styles.statVal}>12+</span>
                  <span className={styles.statLbl}>Markets</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statVal}>24/7</span>
                  <span className={styles.statLbl}>Live trading</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statVal}>$0</span>
                  <span className={styles.statLbl}>To start</span>
                </div>
              </div>
            </div>

            <div className={styles.heroRight}>
              <PulseOrb />
              <LivePriceCard />
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.section} id="features">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>What you get</div>
          <h2>Everything a trader needs</h2>
          <p className={styles.sectionSub}>
            Dopra brings professional-grade tools to your pocket — whether you trade manually or let bots do the work.
          </p>
          <div className={styles.featGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featCard}>
                <div className={styles.featIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODES ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="modes">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Trading modes</div>
          <h2>Your strategy, your pace</h2>
          <p className={styles.sectionSub}>
            Switch between full manual control and 24/7 automation — or run both at once.
          </p>
          <div className={styles.modesGrid}>
            <div className={styles.modeCard}>
              <div className={styles.modeBadge}>Manual</div>
              <h3>Manual Trader</h3>
              <p>Full control over every trade. Set parameters, choose contract types, execute with one tap.</p>
              <ul className={styles.modeList}>
                <li>Rise/Fall, Digits, Multipliers, Touch</li>
                <li>Real-time price streaming</li>
                <li>Open positions dashboard</li>
                <li>Full trade history & P&L</li>
              </ul>
            </div>
            <div className={`${styles.modeCard} ${styles.modeCardAccent}`}>
              <div className={`${styles.modeBadge} ${styles.modeBadgeAccent}`}>Automated</div>
              <h3>Bot Builder</h3>
              <p>Build and deploy automated strategies visually. Runs 24/7 while you focus on what matters.</p>
              <ul className={styles.modeList}>
                <li>Visual block-based builder</li>
                <li>Martingale, D'Alembert & more</li>
                <li>Stop loss / take profit logic</li>
                <li>Multi-market simultaneous bots</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <div className={styles.sectionLabel} style={{ textAlign: 'center' }}>Start today</div>
            <h2>Ready to trade smarter?</h2>
            <p>Connect your Deriv account in seconds. No fees, no setup — just live markets.</p>
            <button className={styles.ctaBtn} onClick={() => navigate('/dashboard')}>
              Launch Dopra
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.logo}>
            <div className={styles.logoMark}><span /></div>
            <span className={styles.logoText}>Dopra</span>
          </div>
          <p className={styles.footerNote}>© 2025 Dopra. Powered by Deriv API.</p>
          <ul className={styles.footerLinks}>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>
      </footer>

    </div>
  )
}