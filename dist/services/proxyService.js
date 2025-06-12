"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
class ProxyService {
    constructor() {
        this.proxies = [];
        this.currentIndex = 0;
        this.failedProxies = new Set();
        this.loadProxiesFromUrl();
    }
    /**
     * Charge la liste des proxies depuis l'URL GitHub
     */
    async loadProxiesFromUrl() {
        try {
            const response = await fetch("https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt");
            if (!response.ok) {
                throw new Error(`Erreur lors du chargement des proxies: ${response.status}`);
            }
            const proxyText = await response.text();
            this.parseProxies(proxyText);
            console.log(`${this.proxies.length} proxies chargés avec succès`);
        }
        catch (error) {
            console.error("Erreur lors du chargement des proxies:", error);
            // Fallback: utiliser quelques proxies de base si le chargement échoue
            this.loadFallbackProxies();
        }
    }
    /**
     * Parse le texte contenant les proxies
     */
    parseProxies(proxyText) {
        const lines = proxyText.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
            const [host, port] = line.trim().split(":");
            if (host && port && !isNaN(Number(port))) {
                this.proxies.push({
                    host: host.trim(),
                    port: Number(port),
                    protocol: "http",
                });
            }
        }
    }
    /**
     * Proxies de secours en cas d'échec du chargement
     */
    loadFallbackProxies() {
        this.proxies = [
            { host: "185.226.204.160", port: 5713, protocol: "http" },
            { host: "103.210.206.26", port: 8080, protocol: "http" },
            { host: "156.228.116.140", port: 3128, protocol: "http" },
            { host: "122.52.141.182", port: 8080, protocol: "http" },
            { host: "162.220.246.225", port: 6509, protocol: "http" },
        ];
        console.log(`${this.proxies.length} proxies de secours chargés`);
    }
    /**
     * Obtient le prochain proxy dans la rotation
     */
    getNextProxy() {
        if (this.proxies.length === 0) {
            return null;
        }
        // Trouve un proxy qui n'a pas échoué
        let attempts = 0;
        while (attempts < this.proxies.length) {
            const proxy = this.proxies[this.currentIndex];
            const proxyKey = `${proxy.host}:${proxy.port}`;
            this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
            if (!this.failedProxies.has(proxyKey)) {
                return proxy;
            }
            attempts++;
        }
        // Si tous les proxies ont échoué, réinitialise la liste des échecs
        console.log("Tous les proxies ont échoué, réinitialisation...");
        this.failedProxies.clear();
        return this.proxies[this.currentIndex];
    }
    /**
     * Marque un proxy comme ayant échoué
     */
    markProxyAsFailed(proxy) {
        const proxyKey = `${proxy.host}:${proxy.port}`;
        this.failedProxies.add(proxyKey);
        console.log(`Proxy marqué comme défaillant: ${proxyKey}`);
    }
    /**
     * Obtient les statistiques des proxies
     */
    getStats() {
        return {
            total: this.proxies.length,
            failed: this.failedProxies.size,
            available: this.proxies.length - this.failedProxies.size,
        };
    }
    /**
     * Teste si un proxy fonctionne
     */
    async testProxy(proxy, timeout = 10000) {
        try {
            const proxyUrl = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
            // Test simple avec httpbin
            const response = await fetch("https://httpbin.org/ip", {
                // @ts-ignore - Node.js fetch ne supporte pas nativement les proxies
                agent: proxyUrl,
                signal: AbortSignal.timeout(timeout),
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
                },
            });
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Réinitialise la liste des proxies défaillants
     */
    resetFailedProxies() {
        this.failedProxies.clear();
        console.log("Liste des proxies défaillants réinitialisée");
    }
}
exports.ProxyService = ProxyService;
