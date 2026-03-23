import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-xl font-satoshi font-medium">
                <span className="mb-0.5 truncate text-black leading-tight">
                    CivicLens AI
                </span>
            </div>
        </>
    );
}
