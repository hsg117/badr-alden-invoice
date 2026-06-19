import logoSvg from '/logo.svg'

function Logo({ size = 80 }: { size?: number }) {
  return (
    <img
      src={logoSvg}
      alt="FsFSn01"
      width={size}
      height={size}
      className="logo-img"
    />
  )
}

export default Logo
