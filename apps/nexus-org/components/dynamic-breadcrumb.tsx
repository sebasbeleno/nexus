"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import Link from "next/link";
import React from "react";

// Define title mappings for path segments
const pathTitleMap: Record<string, string> = {
  organizations: "Organizations",
  users: "Users",
  dashboard: "Dashboard",
  new: "New",
  settings: "Settings",
  "(super_admin)": "Admin",
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  
  // Remove the initial slash and split the path into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Filter out the (super_admin) segment from display
  const displaySegments = segments.filter(segment => segment !== "(super_admin)");
  
  // If we have no segments to display, just show "Dashboard"
  if (displaySegments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displaySegments.map((segment, index) => {
          // Build the path up to this segment
          const href = `/${displaySegments.slice(0, index + 1).join("/")}`;
          
          // Check if this is a dynamic segment (starts with '[' and ends with ']')
          const isDynamicSegment = segment.startsWith("[") && segment.endsWith("]");
          
          // Get a readable title for the segment
          let title = isDynamicSegment 
            ? segment.slice(1, -1) // Remove the brackets
            : pathTitleMap[segment] || segment; // Use mapping or capitalize
          
          // Capitalize first letter if not found in mapping
          if (!pathTitleMap[segment] && !isDynamicSegment) {
            title = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
          
          // For the last segment, render as current page
          const isLastSegment = index === displaySegments.length - 1;
          
          return (
            <React.Fragment key={segment}>
              <BreadcrumbItem>
                {isLastSegment ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href} as={Link}>
                    {title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLastSegment && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
