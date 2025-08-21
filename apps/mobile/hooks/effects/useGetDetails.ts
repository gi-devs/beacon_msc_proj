import { useEffect, useState } from 'react';
import { Toast } from 'toastify-react-native';
import { useRouter } from 'expo-router';

type GetDetail<T> = {
  id: string | string[] | undefined;
  items: T[];
  fetchSingle: (id: number) => Promise<T | null>;
};

export function useGetDetail<T extends { id: number }>({
  id,
  items,
  fetchSingle,
}: GetDetail<T>) {
  const router = useRouter();
  const [selected, setSelected] = useState<T | null>(null);

  useEffect(() => {
    const failed = (msg = 'Not found') => {
      Toast.error(msg);
      router.push('/(home)');
    };

    const load = async () => {
      if (!id) return failed();

      const parsedId = parseInt(id as string, 10);
      if (isNaN(parsedId)) return failed();

      const found = items.find((i) => i.id === parsedId);
      if (found) return setSelected(found);

      const fetched = await fetchSingle(parsedId);
      if (fetched) return setSelected(fetched);

      failed();
    };

    setSelected(null);
    void load();
  }, [id]);

  return selected;
}
