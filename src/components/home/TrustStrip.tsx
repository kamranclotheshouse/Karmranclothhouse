const TRUST_ITEMS = [
  {
    title: 'Quality Guarantee',
    sub: 'Only Original & Branded Fabrics',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Imported & Local Collection',
    sub: 'Wide Range of Premium Brands',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: 'Secure & Reliable Ordering',
    sub: 'Cash on Delivery',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M7 15h.01M11 15h2" />
        <path d="M2 9h20" />
      </svg>
    ),
  },
];

export default function TrustStrip() {
  return (
    <section className="py-12 md:py-14" style={{ backgroundColor: 'var(--color-green-deep)' }}>
      {/* Gold top border */}
      <div className="h-[1px] mb-12 md:mb-14 -mt-12 md:-mt-14" style={{ backgroundColor: 'rgba(201,162,39,0.25)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className="group/trust flex items-center justify-center gap-5 md:px-10 transition-transform duration-300 hover:-translate-y-1"
              style={{
                borderRight: i < TRUST_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              {/* Icon circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover/trust:scale-110 group-hover/trust:shadow-[0_0_20px_rgba(201,162,39,0.35)]"
                style={{
                  backgroundColor: 'rgba(201,162,39,0.1)',
                  border: '1px solid rgba(201,162,39,0.3)',
                  color: 'var(--color-gold)',
                }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight transition-colors duration-300 group-hover/trust:text-[#C9A227]">{item.title}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
