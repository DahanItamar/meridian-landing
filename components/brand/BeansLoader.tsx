import type { CSSProperties } from "react";

/**
 * The beans, bouncing, while the 3D pack loads.
 *
 * Inline rather than an `<img src>` because AC-028 asks for vector marks as
 * inline SVG, the same reason `Roundel` is drawn here — and because inline
 * costs no request for something that has to be on screen in the first frame,
 * which is exactly when a second request is least affordable.
 *
 * The motion is SMIL: four `animateTransform` scale bounces on a 1.3s loop,
 * offset by `keyTimes` so the beans lift in sequence. The browser runs it
 * natively, with no runtime and no hydration.
 *
 * NOT ORIGINAL WORK. Exported from LottieFiles and recoloured from its browns to
 * this project's gold ramp; geometry and timings are the author's. The licence
 * is unconfirmed — see CREDITS.md before this ships.
 *
 * SMIL cannot be paused from CSS, so `.beans-loader` hides it outright under
 * reduced motion rather than freezing it mid-bounce. Nothing is lost: the poster
 * frame underneath is already showing the product.
 */
export function BeansLoader({ style }: { style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="beans-loader"
      style={style}
    >
      <g transform="matrix(1,0,0,1,15.288,171.572)">
        <g>
          <g transform="translate(413.244,77.423) rotate(-26.823)">
            <g transform="scale(1,1)">
              <animateTransform
                repeatCount="indefinite"
                type="scale"
                attributeName="transform"
                dur="1.3s"
                begin="0s"
                calcMode="spline"
                values="1 1; 1 1; 1.3 1.3; 1 1"
                keyTimes="0; 0.692308; 0.846154; 1"
                keySplines="0 0 1 1; 0.645 0.045 0.355 1; 0.645 0.045 0.355 1"
                fill="freeze"
              />
              <g transform="translate(-204.793,-150.745)">
                <g>
                  <path
                    fill="#6b5636"
                    fillOpacity="1"
                    d="M227.3,94.54C224.28,98.06,221.7,101.77,218.44,104.73C203.64,118.19,197.85,134.85,199.4,154.6C199.95,161.62,199.95,168.86,198.87,175.78C196.92,188.23,189.28,197.42,179.21,204.44C177.28,205.79,173.35,205.81,171.04,204.82C159.43,199.79,153.42,189.99,152.81,177.96C151.04,143.34,165,115.9,193.32,96.15C203.94,88.75,216.37,88.67,227.3,94.54C227.3,94.54,227.3,94.54,227.3,94.54Z"
                  />
                </g>
                <g>
                  <path
                    fill="#6b5636"
                    fillOpacity="1"
                    d="M185.29,209.99C189.97,205.94,193.25,203.26,196.36,200.38C208.08,189.52,212.71,176.12,209.56,160.48C204.31,134.5,217.24,116.15,234.73,99.79C236.03,98.57,240.55,99.06,242.35,100.4C253.49,108.7,257.21,120.91,256.91,133.92C256.22,163.77,243.45,187.54,218.43,204.18C209.3,210.26,199.08,212.82,185.29,209.99C185.29,209.99,185.29,209.99,185.29,209.99Z"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
        <g>
          <g transform="translate(297.244,77.423) rotate(-26.823)">
            <g transform="scale(1,1)">
              <animateTransform
                repeatCount="indefinite"
                type="scale"
                attributeName="transform"
                dur="1.3s"
                begin="0s"
                calcMode="spline"
                values="1 1; 1 1; 1.3 1.3; 1 1; 1 1"
                keyTimes="0; 0.461538; 0.615385; 0.769231; 1"
                keySplines="0 0 1 1; 0.645 0.045 0.355 1; 0.645 0.045 0.355 1; 0 0 1 1"
                fill="freeze"
              />
              <g transform="translate(-204.793,-150.745)">
                <g>
                  <path
                    fill="#8a6a34"
                    fillOpacity="1"
                    d="M227.3,94.54C224.28,98.06,221.7,101.77,218.44,104.73C203.64,118.19,197.85,134.85,199.4,154.6C199.95,161.62,199.95,168.86,198.87,175.78C196.92,188.23,189.28,197.42,179.21,204.44C177.28,205.79,173.35,205.81,171.04,204.82C159.43,199.79,153.42,189.99,152.81,177.96C151.04,143.34,165,115.9,193.32,96.15C203.94,88.75,216.37,88.67,227.3,94.54C227.3,94.54,227.3,94.54,227.3,94.54Z"
                  />
                </g>
                <g>
                  <path
                    fill="#8a6a34"
                    fillOpacity="1"
                    d="M185.29,209.99C189.97,205.94,193.25,203.26,196.36,200.38C208.08,189.52,212.71,176.12,209.56,160.48C204.31,134.5,217.24,116.15,234.73,99.79C236.03,98.57,240.55,99.06,242.35,100.4C253.49,108.7,257.21,120.91,256.91,133.92C256.22,163.77,243.45,187.54,218.43,204.18C209.3,210.26,199.08,212.82,185.29,209.99C185.29,209.99,185.29,209.99,185.29,209.99Z"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
        <g>
          <g transform="translate(172.244,77.292) rotate(-26.823)">
            <g transform="scale(1,1)">
              <animateTransform
                repeatCount="indefinite"
                type="scale"
                attributeName="transform"
                dur="1.3s"
                begin="0s"
                calcMode="spline"
                values="1 1; 1 1; 1.3 1.3; 1 1; 1 1"
                keyTimes="0; 0.230769; 0.384615; 0.538462; 1"
                keySplines="0 0 1 1; 0.645 0.045 0.355 1; 0.645 0.045 0.355 1; 0 0 1 1"
                fill="freeze"
              />
              <g transform="translate(-204.793,-150.745)">
                <g>
                  <path
                    fill="#b08a4e"
                    fillOpacity="1"
                    d="M227.3,94.54C224.28,98.06,221.7,101.77,218.44,104.73C203.64,118.19,197.85,134.85,199.4,154.6C199.95,161.62,199.95,168.86,198.87,175.78C196.92,188.23,189.28,197.42,179.21,204.44C177.28,205.79,173.35,205.81,171.04,204.82C159.43,199.79,153.42,189.99,152.81,177.96C151.04,143.34,165,115.9,193.32,96.15C203.94,88.75,216.37,88.67,227.3,94.54C227.3,94.54,227.3,94.54,227.3,94.54Z"
                  />
                </g>
                <g>
                  <path
                    fill="#b08a4e"
                    fillOpacity="1"
                    d="M185.29,209.99C189.97,205.94,193.25,203.26,196.36,200.38C208.08,189.52,212.71,176.12,209.56,160.48C204.31,134.5,217.24,116.15,234.73,99.79C236.03,98.57,240.55,99.06,242.35,100.4C253.49,108.7,257.21,120.91,256.91,133.92C256.22,163.77,243.45,187.54,218.43,204.18C209.3,210.26,199.08,212.82,185.29,209.99C185.29,209.99,185.29,209.99,185.29,209.99Z"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
        <g>
          <g transform="translate(55.244,77.423) rotate(-26.823)">
            <g transform="scale(1,1)">
              <animateTransform
                repeatCount="indefinite"
                type="scale"
                attributeName="transform"
                dur="1.3s"
                begin="0s"
                calcMode="spline"
                values="1 1; 1.3 1.3; 1 1; 1 1"
                keyTimes="0; 0.153846; 0.307692; 1"
                keySplines="0.645 0.045 0.355 1; 0.645 0.045 0.355 1; 0 0 1 1"
                fill="freeze"
              />
              <g transform="translate(-204.793,-150.745)">
                <g>
                  <path
                    fill="#e3b77c"
                    fillOpacity="1"
                    d="M227.3,94.54C224.28,98.06,221.7,101.77,218.44,104.73C203.64,118.19,197.85,134.85,199.4,154.6C199.95,161.62,199.95,168.86,198.87,175.78C196.92,188.23,189.28,197.42,179.21,204.44C177.28,205.79,173.35,205.81,171.04,204.82C159.43,199.79,153.42,189.99,152.81,177.96C151.04,143.34,165,115.9,193.32,96.15C203.94,88.75,216.37,88.67,227.3,94.54C227.3,94.54,227.3,94.54,227.3,94.54Z"
                  />
                </g>
                <g>
                  <path
                    fill="#e3b77c"
                    fillOpacity="1"
                    d="M185.29,209.99C189.97,205.94,193.25,203.26,196.36,200.38C208.08,189.52,212.71,176.12,209.56,160.48C204.31,134.5,217.24,116.15,234.73,99.79C236.03,98.57,240.55,99.06,242.35,100.4C253.49,108.7,257.21,120.91,256.91,133.92C256.22,163.77,243.45,187.54,218.43,204.18C209.3,210.26,199.08,212.82,185.29,209.99C185.29,209.99,185.29,209.99,185.29,209.99Z"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
