import AdminClient from './AdminClient';

export const metadata = {
    title: 'Admin | Remabell Boutique',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminPage() {
    return <AdminClient isVercel={!!process.env.VERCEL} />;
}
