import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

const GREEN = "#2b5541"
const COPPER = "#c0703f"

const FLAME =
  "M143.5 103C145 108 146 113 148 120C154 134 166 149 176 160C190 176 201 194 205 207C208 216 208 226 206 232C204 220 197 203 186 187C192 199 198 214 202 233C202.5 240 201 246 199 251C198 245 197 240 196 234C192 214 180 196 166 182C150 166 138.5 146 138 132C137.5 120 139 111 143.5 103Z"

const FLAME_OFFSETS = ["0 0", "-14 49", "-29 98"]

const DIAMONDS = [
  { d: "M108 49 132.5 73.5 108 98 83.5 73.5Z", fill: GREEN },
  { d: "M206 49 230.5 73.5 206 98 181.5 73.5Z", fill: GREEN },
  { d: "M157 12 193 48 157 84 121 48Z", fill: COPPER },
]

export function LogoMark({ className, title = "شعار الشامي" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="36 8 242 388" className={cn("h-auto", className)} role="img" aria-label={title}>
      <g fill="none" stroke={GREEN}>
        <path
          data-logo="frame"
          pathLength={1}
          strokeWidth={3.5}
          d="M90 67 80.2 69.7A114.75 114.75 0 0 0 42.25 155V275.5A114.75 114.75 0 0 0 271.75 275.5V155A114.75 114.75 0 0 0 233.8 69.7L224 67"
        />
        <path
          data-logo="frame"
          pathLength={1}
          strokeWidth={14}
          d="M94.8 75.4A101 101 0 0 0 56 155V275.5A101 101 0 0 0 258 275.5V155A101 101 0 0 0 219.2 75.4"
        />
      </g>
      {DIAMONDS.map((diamond, i) => (
        <path
          key={diamond.d}
          data-logo="diamond"
          d={diamond.d}
          fill={diamond.fill}
          style={{ "--i": i } as CSSProperties}
        />
      ))}
      <g fill={COPPER}>
        {FLAME_OFFSETS.map((offset, i) => (
          <path
            key={offset}
            data-logo="flame"
            d={FLAME}
            transform={`translate(${offset})`}
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </g>
    </svg>
  )
}
