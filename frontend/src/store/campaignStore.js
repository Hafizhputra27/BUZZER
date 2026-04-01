import { create } from 'zustand';

const useCampaignStore = create((set) => ({
  campaigns: [],
  setCampaigns: (campaigns) => set({ campaigns }),
  addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
}));

export default useCampaignStore;
