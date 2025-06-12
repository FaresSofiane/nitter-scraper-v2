"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testProxySetup = testProxySetup;
const proxyService_1 = require("../services/proxyService");
/**
 * Teste la fonctionnalité des proxies
 */
async function testProxySetup() {
    console.log("🔧 Test de la configuration des proxies...\n");
    const proxyService = new proxyService_1.ProxyService();
    // Attendre que les proxies soient chargés
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const stats = proxyService.getStats();
    console.log(`📊 Statistiques des proxies:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Disponibles: ${stats.available}`);
    console.log(`   Défaillants: ${stats.failed}\n`);
    if (stats.total === 0) {
        console.log("❌ Aucun proxy chargé. Vérifiez votre connexion internet.");
        return;
    }
    // Tester quelques proxies
    console.log("🧪 Test de quelques proxies...");
    const maxTests = Math.min(5, stats.total);
    let successCount = 0;
    for (let i = 0; i < maxTests; i++) {
        const proxy = proxyService.getNextProxy();
        if (!proxy)
            break;
        console.log(`   Test ${i + 1}: ${proxy.host}:${proxy.port}...`, {
            end: "",
        });
        try {
            const isWorking = await proxyService.testProxy(proxy, 5000);
            if (isWorking) {
                console.log(" ✅ Fonctionne");
                successCount++;
            }
            else {
                console.log(" ❌ Ne fonctionne pas");
                proxyService.markProxyAsFailed(proxy);
            }
        }
        catch (error) {
            console.log(" ❌ Erreur de test");
            proxyService.markProxyAsFailed(proxy);
        }
    }
    console.log(`\n📈 Résultats: ${successCount}/${maxTests} proxies fonctionnels`);
    if (successCount > 0) {
        console.log("✅ Configuration des proxies prête à l'utilisation !");
    }
    else {
        console.log("⚠️  Aucun proxy fonctionnel trouvé. Le scraper fonctionnera sans proxy.");
    }
}
