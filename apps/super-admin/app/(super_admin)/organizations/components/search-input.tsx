"use client"

import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SearchInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Buscar..." }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  
  // Update URL with search parameter when search term changes
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      
      return params.toString();
    },
    [searchParams]
  );
  
  // Debounce search to avoid too many URL updates
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`${pathname}?${createQueryString("search", searchTerm)}`);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, createQueryString, pathname, router]);
  
  return (
    <div className="relative max-w-sm w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 pr-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
