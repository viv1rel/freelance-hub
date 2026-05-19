export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">FreelanceHub</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Управляйте фриланс-бизнесом в одном месте
                    </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
