export interface ProxyConfig {
    host: string;
    port: number;
    protocol: "http" | "https";
}
export declare class ProxyService {
    private proxies;
    private currentIndex;
    private failedProxies;
    constructor();
    /**
     * Charge la liste des proxies depuis l'URL GitHub
     */
    private loadProxiesFromUrl;
    /**
     * Parse le texte contenant les proxies
     */
    private parseProxies;
    /**
     * Proxies de secours en cas d'échec du chargement
     */
    private loadFallbackProxies;
    /**
     * Obtient le prochain proxy dans la rotation
     */
    getNextProxy(): ProxyConfig | null;
    /**
     * Marque un proxy comme ayant échoué
     */
    markProxyAsFailed(proxy: ProxyConfig): void;
    /**
     * Obtient les statistiques des proxies
     */
    getStats(): {
        total: number;
        failed: number;
        available: number;
    };
    /**
     * Teste si un proxy fonctionne
     */
    testProxy(proxy: ProxyConfig, timeout?: number): Promise<boolean>;
    /**
     * Réinitialise la liste des proxies défaillants
     */
    resetFailedProxies(): void;
}
