// Utility for capturing Chrome tab info
export function captureTabInfo(form: any) {
    const chromeTabs = (window as any)?.chrome?.tabs;
    if (chromeTabs) {
        chromeTabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
            if (tabs && tabs.length > 0) {
                form.patchValue({
                    title: tabs[0].title ?? '',
                    url: tabs[0].url ?? ''
                });
            }
        });
    } else {
        const currentUrl = form.get('url')?.value;
        form.patchValue({
            title: document.title,
            url: currentUrl ?? window.location.href
        });
    }
}
