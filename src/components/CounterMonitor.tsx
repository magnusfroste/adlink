
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface ConsistencyCheck {
  table_name: string;
  record_id: string;
  stored_count: number;
  actual_count: number;
  discrepancy: number;
}

export default function CounterMonitor() {
  const [consistencyResults, setConsistencyResults] = useState<ConsistencyCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const checkConsistency = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_counter_consistency');
      
      if (error) {
        toast.error('Failed to check consistency: ' + error.message);
        return;
      }
      
      setConsistencyResults(data || []);
      
      if (data && data.length === 0) {
        toast.success('All counters are consistent!');
      } else {
        toast.warning(`Found ${data?.length || 0} inconsistencies`);
      }
    } catch (error) {
      toast.error('Failed to check consistency');
      console.error('Consistency check error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Counter Consistency Monitor
        </CardTitle>
        <CardDescription>
          Check if view and click counters match the actual tracking data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={checkConsistency} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking...' : 'Check Consistency'}
          </Button>
          
          {consistencyResults.length === 0 && !loading && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">All counters consistent</span>
            </div>
          )}
        </div>

        {consistencyResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {consistencyResults.length} Inconsistencies Found
              </Badge>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Stored Count</TableHead>
                  <TableHead>Actual Count</TableHead>
                  <TableHead>Discrepancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consistencyResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {result.table_name.replace('_', ' ').toUpperCase()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {result.record_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{result.stored_count}</TableCell>
                    <TableCell>{result.actual_count}</TableCell>
                    <TableCell>
                      <Badge variant={result.discrepancy === 0 ? 'default' : 'destructive'}>
                        {result.discrepancy > 0 ? '+' : ''}{result.discrepancy}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
