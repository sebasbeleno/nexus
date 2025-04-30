"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Building } from "lucide-react";
import { Log } from "@/app/(super_admin)/dashboard/page";
import { Button } from "@workspace/ui/components/button";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Filter, Check } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils"

type SystemLogsProps = {
  logs: Log[];
}

export function SystemLogs({ logs }: SystemLogsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    userName: "",
    companyName: "",
    timeAgo: "all" // 'all', 'today', 'week', 'month'
  });
  
  // State for autocomplete suggestions
  const [userSuggestions, setUserSuggestions] = useState<string[]>([]);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [userInputValue, setUserInputValue] = useState("");
  const [companyInputValue, setCompanyInputValue] = useState("");
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false);
  
  const [filteredLogs, setFilteredLogs] = useState<Log[]>(logs);
  const itemsPerPage = 5;
  
  // Extract unique user names and company names from logs
  useEffect(() => {
    // Extract and deduplicate user names
    const uniqueUsers = Array.from(
      new Set(
        logs
          .map(log => log.user.first_name)
          .filter(name => name && name !== 'El Sistema')
      )
    ).sort();
    
    setUserSuggestions(uniqueUsers);
    
    // Extract and deduplicate company names from details
    const companyNames = logs
      .map(log => log.details?.name || log.details?.old_data?.name)
      .filter(Boolean) as string[];
      
    const uniqueCompanies = Array.from(new Set(companyNames)).sort();
    setCompanySuggestions(uniqueCompanies);
  }, [logs]);
  
  // Apply filters when filters or logs change
  useEffect(() => {
    let result = logs;
    
    // Filter by user name
    if (filters.userName) {
      result = result.filter(log => 
        log.user.first_name.toLowerCase().includes(filters.userName.toLowerCase())
      );
    }
    
    // Filter by company name (in details)
    if (filters.companyName) {
      result = result.filter(log => {
        const companyName = log.details?.name || log.details?.old_data?.name || "";
        return companyName.toLowerCase().includes(filters.companyName.toLowerCase());
      });
    }
    
    // Filter by time ago
    if (filters.timeAgo !== "all") {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (filters.timeAgo === "today") {
        cutoffDate.setHours(0, 0, 0, 0); // Start of today
      } else if (filters.timeAgo === "week") {
        cutoffDate.setDate(now.getDate() - 7); // Last 7 days
      } else if (filters.timeAgo === "month") {
        cutoffDate.setMonth(now.getMonth() - 1); // Last 30 days
      }
      
      result = result.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= cutoffDate;
      });
    }
    
    setFilteredLogs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, logs]);
  
  // Calculate total pages and current items for the page
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page functions
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  
  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update the input values for autocomplete display
    if (key === 'userName') setUserInputValue(value);
    if (key === 'companyName') setCompanyInputValue(value);
  };
  
  // Handle autocomplete selection
  const handleUserSelect = (selectedUser: string) => {
    setFilters(prev => ({ ...prev, userName: selectedUser }));
    setUserInputValue(selectedUser);
    setUserPopoverOpen(false);
  };
  
  const handleCompanySelect = (selectedCompany: string) => {
    setFilters(prev => ({ ...prev, companyName: selectedCompany }));
    setCompanyInputValue(selectedCompany);
    setCompanyPopoverOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userName: "",
      companyName: "",
      timeAgo: "all"
    });
    setUserInputValue("");
    setCompanyInputValue("");
  };

  // Format log title based on action_type
  const formatLogTitle = (log: Log) => {
    const { action_type, user, details } = log;
    
    if (action_type === 'user_created') {
      return `${user.first_name} ha creado al usuario ${details.email || 'desconocido'}`;
    } else if (action_type === 'organization_created') {
      return `${user.first_name} ha creado la organizacion: ${details.name || 'desconocida'}`;
    } else if (action_type === 'organization_updated') {
      return `${user.first_name} ha editado la organizacion ${details.old_data.name || 'desconocida'}`;
    } else if (action_type === 'organization_deleted') {
      return `${user.first_name} borro la organizacion ${details.name || 'desconocida'}.`;
    } else {
      return `${user.first_name} ha realizado: ${action_type}`;
    }
  };

  // Format date to time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHrs = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHrs / 24);

    if (diffSec < 60) {
      return `hace ${diffSec} segundos`;
    } else if (diffMin < 60) {
      return `hace ${diffMin} minutos`;
    } else if (diffHrs < 24) {
      return `hace ${diffHrs} horas`;
    } else {
      return `hace ${diffDays} días`;
    }
  };

  // Filter suggestions based on current input
  const filteredUserSuggestions = userInputValue 
    ? userSuggestions.filter(user => 
        user.toLowerCase().includes(userInputValue.toLowerCase()))
    : userSuggestions;
    
  const filteredCompanySuggestions = companyInputValue
    ? companySuggestions.filter(company => 
        company.toLowerCase().includes(companyInputValue.toLowerCase()))
    : companySuggestions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">System Logs</CardTitle>
        <CardDescription className="text-sm text-muted-foreground"> 
          Actividad reciente en el sistema
        </CardDescription>
        
        {/* Filter Section */}
        <div className="bg-muted/50 p-4 rounded-lg mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4" />
            <h3 className="text-sm font-medium">Filtros</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="userName">Usuario</Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userPopoverOpen}
                    className="w-full justify-between text-left font-normal"
                  >
                    {userInputValue || "Seleccionar usuario"}
                    <ChevronLeft className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar usuario..." 
                      value={userInputValue}
                      onValueChange={(value) => {
                        setUserInputValue(value);
                        handleFilterChange("userName", value);
                      }}
                    />
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {filteredUserSuggestions.map((user) => (
                          <CommandItem
                            key={user}
                            value={user}
                            onSelect={() => handleUserSelect(user)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                userInputValue === user ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Organización</Label>
              <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={companyPopoverOpen}
                    className="w-full justify-between text-left font-normal"
                  >
                    {companyInputValue || "Seleccionar organización"}
                    <ChevronLeft className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar organización..." 
                      value={companyInputValue}
                      onValueChange={(value) => {
                        setCompanyInputValue(value);
                        handleFilterChange("companyName", value);
                      }}
                    />
                    <CommandEmpty>No se encontraron organizaciones.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {filteredCompanySuggestions.map((company) => (
                          <CommandItem
                            key={company}
                            value={company}
                            onSelect={() => handleCompanySelect(company)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                companyInputValue === company ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {company}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeAgo">Período</Label>
              <Select
                value={filters.timeAgo}
                onValueChange={(value) => handleFilterChange("timeAgo", value)}
              >
                <SelectTrigger id="timeAgo">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron registros con los filtros aplicados.
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {currentLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Building className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{formatLogTitle(log)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(log.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredLogs.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredLogs.length)} de {filteredLogs.length} registros
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToPreviousPage} 
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Página {currentPage} de {totalPages || 1}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextPage} 
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
