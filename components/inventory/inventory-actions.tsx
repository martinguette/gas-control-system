'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings, AlertTriangle, BarChart3 } from 'lucide-react';
import { InventoryAddDialog } from './inventory-add-dialog';
import { InventoryAlertsDialog } from './inventory-alerts-dialog';
import { InventoryReportsDialog } from './inventory-reports-dialog';

export function InventoryActions() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [showReportsDialog, setShowReportsDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReportsDialog(true)}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Reportes
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAlertsDialog(true)}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Alertas
        </Button>

        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Inventario
        </Button>
      </div>

      {/* Dialogs */}
      <InventoryAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <InventoryAlertsDialog
        open={showAlertsDialog}
        onOpenChange={setShowAlertsDialog}
      />

      <InventoryReportsDialog
        open={showReportsDialog}
        onOpenChange={setShowReportsDialog}
      />
    </>
  );
}
