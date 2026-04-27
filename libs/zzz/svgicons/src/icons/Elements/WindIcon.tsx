import type { SvgIconProps } from '@mui/material'
import { SvgIcon } from '@mui/material'

export const WindIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      version="1.1"
    >
      <defs>
        <linearGradient
          id="zzz_wind_icon"
          gradientUnits="userSpaceOnUse"
          x1="12"
          y1="2"
          x2="12"
          y2="22"
          gradientTransform="matrix(1,0,0,1,0,0)"
        >
          <stop
            offset="0"
            style={{ stopColor: 'rgb(70%,90%,100%)', stopOpacity: 1 }}
          />
          <stop
            offset="1"
            style={{ stopColor: 'rgb(50%,75%,90%)', stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <g id="surface1">
        <path
          style={{
            stroke: 'none',
            fillRule: 'nonzero',
            fill: 'url(#zzz_wind_icon)',
          }}
          d="M3.5,8 C3.5,8 5.5,6 8,6 C10.5,6 12,8 12,8 C12,8 13.5,6 16,6 C18.5,6 20.5,8 20.5,8 L20.5,10 C20.5,10 18.5,12 16,12 C13.5,12 12,10 12,10 C12,10 10.5,12 8,12 C5.5,12 3.5,10 3.5,10 L3.5,8 Z M5,14 C5,14 7,13 9,13 C11,13 12.5,14 12.5,14 C12.5,14 14,13 16,13 C18,13 19,14 19,14 L19,16 C19,16 17,18 14,18 C11,18 9.5,16 9.5,16 C9.5,16 7.5,18 5,18 C2.5,18 1,16 1,16 L1,14 C1,14 2.5,15 5,15"
        />
      </g>
    </svg>
  </SvgIcon>
)