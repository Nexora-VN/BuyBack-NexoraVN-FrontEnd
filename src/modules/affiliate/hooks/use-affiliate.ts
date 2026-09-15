"use client";
import { affiliateService } from "@/modules/affiliate/services/affiliate.service";
import type { AffiliateLinkStatus } from "@/modules/affiliate/types/affiliate";
import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query";
export function useAffiliateLinks(params: { page: number; limit: number; sort?: 'asc' | 'desc'; search?: string; affiliateLinkStatus?: AffiliateLinkStatus }) { return useQuery({ queryKey: ["affiliate", params], queryFn: () => affiliateService.list(params) }); }
export function useAffiliateMutations() { const client = useQueryClient(); const done = () => client.invalidateQueries({ queryKey: ["affiliate"] }); return { update: useMutation({ mutationFn: ({ id, status }: { id: string; status: AffiliateLinkStatus }) => affiliateService.update(id, { affiliateLinkStatus: status }), onSuccess: done }), remove: useMutation({ mutationFn: affiliateService.remove, onSuccess: done }) }; }
