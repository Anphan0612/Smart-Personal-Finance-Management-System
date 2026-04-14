import apiClient from "./api";
import { useAppStore } from "../store/useAppStore";

/**
 * Service to refresh application metadata (wallets, categories).
 * Extracted from useAppStore to break the circular dependency between API and Store.
 */
export const refreshMetadata = async () => {
    const { setState, getState } = useAppStore;
    
    setState({ isMetadataLoading: true });
    
    try {
        console.log("[MetadataService] Refreshing metadata...");
        const [walletRes, categoryRes] = await Promise.all([
            apiClient.get("/wallets"),
            apiClient.get("/categories")
        ]);

        if (walletRes.data.success && categoryRes.data.success) {
            const fetchedWallets = walletRes.data.data;
            const fetchedCategories = categoryRes.data.data;
            
            setState({ 
                wallets: fetchedWallets, 
                categories: fetchedCategories 
            });

            // Auto-select active wallet if not set
            const currentActive = getState().activeWalletId;
            if (!currentActive && fetchedWallets.length > 0) {
                setState({ activeWalletId: fetchedWallets[0].id });
            }
            
            console.log("[MetadataService] Metadata refresh successful.");
        }
    } catch (error) {
        console.error("[MetadataService] Metadata refresh failed:", error);
    } finally {
        setState({ isMetadataLoading: false });
    }
};
