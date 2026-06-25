'use client';

import Link from 'next/link';
import { Store, CreditCard, Users, Truck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import styles from './page.module.css';

const apps = [
  {
    name: 'Seller App',
    desc: 'Products, orders, users, reservations, reviews and system health.',
    href: '/dashboard/seller',
    icon: Store,
    color: 'var(--color-primary)',
    status: 'Connected',
  },
  {
    name: 'Payments App',
    desc: 'Payment processing, refunds and transaction history.',
    href: '/dashboard/payments',
    icon: CreditCard,
    color: 'var(--color-accent)',
    status: 'Connected',
  },
  {
    name: 'Buyer App',
    desc: 'Customer storefront, browsing and purchasing.',
    href: '/dashboard/buyer',
    icon: Users,
    color: 'var(--color-secondary)',
    status: 'Connected',
  },
  {
    name: 'Shipping App',
    desc: 'Shipping dispatch, tracking and delivery.',
    href: '/dashboard/shipping',
    icon: Truck,
    color: 'var(--color-warning)',
    status: 'Connected',
  },
];

export default function DashboardHome() {
  return (
    <div>
      <PageHeader
        title="Control"
        italic="Plane"
        description="Centralized management for the Bonzai ecosystem."
      />

      <div className={styles.appGrid}>
        {apps.map((app) => (
          <Link key={app.name} href={app.href} className={styles.appCard}>
            <div
              className={styles.appIcon}
              style={{ background: 'rgba(27,61,47,0.05)', color: app.color }}
            >
              <app.icon size={22} />
            </div>
            <div className={styles.appBody}>
              <div className={styles.appNameRow}>
                <span className={styles.appName}>{app.name}</span>
                <span
                  className={`${styles.statusBadge} ${app.status === 'Connected' ? styles.statusConnected : styles.statusPending}`}
                >
                  {app.status}
                </span>
              </div>
              <p className={styles.appDesc}>{app.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
