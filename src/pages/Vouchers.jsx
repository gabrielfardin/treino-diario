import { useDailyTracking } from '../hooks/useDailyTracking';
import { rewardDefinitions, dailyVouchers } from '../data/initialData';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Vouchers = () => {
    const { vouchers, useVoucher } = useDailyTracking();
    const navigate = useNavigate();

    const jackpotVouchers = rewardDefinitions.vouchers;
    const dailyVouchersList = dailyVouchers;

    const totalJackpot = jackpotVouchers.reduce((sum, v) => sum + (vouchers[v.id] || 0), 0);
    const totalDaily = dailyVouchersList.reduce((sum, v) => sum + (vouchers[v.id] || 0), 0);
    const totalVouchers = totalJackpot + totalDaily;

    const getRarityColor = (rarity) => rewardDefinitions.rarities[rarity]?.color || '#9CA3AF';

    // Card compacto para mobile
    const VoucherCard = ({ voucher, count }) => (
        <div
            style={{
                background: count > 0 ? 'rgba(0, 255, 136, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                border: count > 0 ? '1px solid rgba(0, 255, 136, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                opacity: count > 0 ? 1 : 0.4
            }}
        >
            {/* Icon */}
            <div style={{
                fontSize: '1.5rem',
                minWidth: '2rem',
                textAlign: 'center'
            }}>
                {voucher.icon}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.15rem'
                }}>
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {voucher.name}
                    </span>
                    <span style={{
                        background: `${getRarityColor(voucher.rarity)}22`,
                        color: getRarityColor(voucher.rarity),
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontSize: '0.5rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        flexShrink: 0
                    }}>
                        {rewardDefinitions.rarities[voucher.rarity]?.name}
                    </span>
                </div>
                <p style={{
                    margin: 0,
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {voucher.description}
                </p>
            </div>

            {/* Count & Action */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                minWidth: '2.5rem'
            }}>
                <div style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: count > 0 ? 'var(--success)' : 'var(--text-muted)'
                }}>
                    {count}
                </div>
                {count > 0 && (
                    <button
                        onClick={() => useVoucher(voucher.id)}
                        style={{
                            padding: '0.2rem 0.5rem',
                            background: 'var(--success)',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#000',
                            fontSize: '0.55rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        USAR
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="page-container" style={{ paddingBottom: '5rem', paddingTop: '1rem' }}>
            {/* Header compacto */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} color="var(--text-primary)" />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem' }}>🎟️ Meus Vales</h1>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {totalVouchers} disponíve{totalVouchers !== 1 ? 'is' : 'l'}
                    </p>
                </div>
            </div>

            {/* Summary Cards - mais compactos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div className="card" style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(168, 85, 247, 0.04))',
                    border: '1px solid rgba(168, 85, 247, 0.25)'
                }}>
                    <div style={{ fontSize: '1.5rem' }}>🎰</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{totalJackpot}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Jackpot (7 dias)</div>
                </div>
                <div className="card" style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.12), rgba(0, 255, 136, 0.04))',
                    border: '1px solid rgba(0, 255, 136, 0.25)'
                }}>
                    <div style={{ fontSize: '1.5rem' }}>🎁</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>{totalDaily}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Caixa Diária</div>
                </div>
            </div>

            {/* Jackpot Section */}
            <section style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.4rem',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.25)'
                }}>
                    <span style={{ fontSize: '1rem' }}>🎰</span>
                    <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Jackpot</h2>
                    <span style={{
                        fontSize: '0.55rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.08)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px'
                    }}>7 dias consecutivos</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {jackpotVouchers.map(v => (
                        <VoucherCard key={v.id} voucher={v} count={vouchers[v.id] || 0} />
                    ))}
                </div>
            </section>

            {/* Daily Section */}
            <section>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.4rem',
                    borderBottom: '1px solid rgba(0, 255, 136, 0.25)'
                }}>
                    <span style={{ fontSize: '1rem' }}>🎁</span>
                    <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Caixa Diária</h2>
                    <span style={{
                        fontSize: '0.55rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.08)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px'
                    }}>100% do dia</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dailyVouchersList.map(v => (
                        <VoucherCard key={v.id} voucher={v} count={vouchers[v.id] || 0} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Vouchers;
