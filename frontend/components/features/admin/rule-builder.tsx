import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ArrowRight } from 'lucide-react';

export function RuleBuilder() {
  const [conditions, setConditions] = useState([
    { field: 'amount', operator: '>', value: '5000' }
  ]);
  const [action, setAction] = useState('require_approver');
  const [approver, setApprover] = useState('cfo');

  const addCondition = () => {
    setConditions([...conditions, { field: 'category', operator: '==', value: 'Travel' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Rule Name</label>
        <Input placeholder="e.g., Executive Travel Approval" defaultValue="Executive Travel Approval" />
      </div>

      <div className="space-y-3 bg-muted/50 p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-primary">WHEN conditions are met:</label>
          <Button variant="outline" size="sm" onClick={addCondition} className="h-7 text-xs gap-1">
            <Plus className="w-3 h-3" /> Add Condition
          </Button>
        </div>
        
        {conditions.map((cond, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-xs font-bold text-muted-foreground w-8 text-center bg-background px-1 py-0.5 rounded border">AND</span>}
            <Select defaultValue={cond.field} onValueChange={(val) => {
              const newC = [...conditions];
              newC[idx].field = val;
              setConditions(newC);
            }}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount ($)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="approvals">Approvals (%)</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue={cond.operator} onValueChange={(val) => {
              const newC = [...conditions];
              newC[idx].operator = val;
              setConditions(newC);
            }}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=">">Greater than</SelectItem>
                <SelectItem value="<">Less than</SelectItem>
                <SelectItem value="==">Equals</SelectItem>
                <SelectItem value=">=">Greather or equal</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              value={cond.value} 
              onChange={(e) => {
                const newC = [...conditions];
                newC[idx].value = e.target.value;
                setConditions(newC);
              }}
              className="h-9 flex-1" 
              placeholder="Value..." 
            />

            {conditions.length > 1 && (
              <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeCondition(idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3 bg-primary/5 p-4 rounded-lg border border-primary/20">
        <label className="text-sm font-semibold text-primary flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          THEN perform action:
        </label>
        
        <div className="flex items-center gap-3">
          <Select defaultValue={action} onValueChange={setAction}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="require_approver">Require Approver</SelectItem>
              <SelectItem value="skip_step">Skip Step</SelectItem>
              <SelectItem value="auto_approve">Automatically Approve</SelectItem>
            </SelectContent>
          </Select>

          {action === 'require_approver' && (
            <Select defaultValue={approver} onValueChange={setApprover}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cfo">Chief Financial Officer (CFO)</SelectItem>
                <SelectItem value="ceo">Chief Executive Officer (CEO)</SelectItem>
                <SelectItem value="manager">Direct Manager</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Visual Expression Preview */}
      <div className="p-3 bg-slate-900 rounded-md border text-xs font-mono">
        <span className="text-slate-400">Rule Expression Preview:</span><br/>
        <span className="text-green-400 mt-1 block">
          IF ( {conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(' AND ')} )<br/>
          THEN {action} {action === 'require_approver' ? `(${approver.toUpperCase()})` : ''}
        </span>
      </div>
    </div>
  );
}
