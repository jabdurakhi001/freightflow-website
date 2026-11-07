import { COMPANY } from '../../content';
import Logo from '../Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-foot">
      <div className="foot">
        <div>
          <Logo />
          <p>{COMPANY.name}<br />Full truckload freight, dispatched from {COMPANY.hub}.</p>
        </div>
        <div>
          <ul>
            <li><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            <li>Dispatch: {COMPANY.hours}</li>
            <li><a href={COMPANY.applyUrl}>Driver application</a></li>
          </ul>
        </div>
        <div>
          <ul>
            <li>USDOT {COMPANY.usdot}</li>
            <li>MC {COMPANY.mc}</li>
            <li>
              <a href={COMPANY.saferUrl} target="_blank" rel="noopener noreferrer">
                FMCSA SAFER snapshot<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
        <p className="fine">
          <span>© {year} {COMPANY.name}.</span>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
        </p>
      </div>
    </footer>
  );
}
