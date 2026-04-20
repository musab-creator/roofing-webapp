import React from 'react';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import AddTerritoryForm from '../../components/forms/crm/add-territory-form';
import { useTerritories } from '../../hooks/useAPI/use-territory';

export default function TerritoriesPage() {
  const { data, isLoading } = useTerritories();

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title="Territories"
        subheading="Zip-coded territories drive round-robin assignment."
        actionButtonText="Add territory"
        sheetTitle="New territory"
        SheetContentBody={AddTerritoryForm}
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.description ?? '—'}</div>
                </div>
                <Badge variant={t.active ? 'default' : 'outline'}>
                  {t.active ? 'active' : 'inactive'}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {t.zip_codes?.slice(0, 12).map((z) => (
                  <Badge key={z} variant="outline" className="text-[10px]">
                    {z}
                  </Badge>
                ))}
                {(t.zip_codes?.length ?? 0) > 12 ? (
                  <Badge variant="secondary" className="text-[10px]">
                    +{(t.zip_codes?.length ?? 0) - 12} more
                  </Badge>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
