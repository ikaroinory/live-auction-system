import useSWR, { SWRConfiguration, Key, MutatorCallback } from 'swr'
import { api } from '@/services'

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  focusThrottleInterval: 5000
}

export const fetcher = async (url: string) => {
  const response = await api.get(url)
  return response.data
}

export interface UseSWRResult<Data, Error = unknown> {
  data: Data | undefined
  error: Error | undefined
  isLoading: boolean
  mutate: (
    data?: Data | Promise<Data> | MutatorCallback<Data>,
    options?: {
      revalidate?: boolean
      populateCache?: boolean
      rollbackOnError?: boolean
    }
  ) => Promise<Data | undefined>
  isValidating: boolean
}

export function useCustomSWR<Data = unknown, Error = unknown>(
  key: Key,
  config?: SWRConfiguration
): UseSWRResult<Data, Error> {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Data, Error>(key, fetcher, {
    ...swrConfig,
    ...config
  })

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating
  }
}
