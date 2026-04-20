import React, { useEffect, useState } from 'react';
import { Button, Modal, Spinner, Table, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import { serviceProviderAgentsService } from '../../../services/serviceProviderAgents.service';
import { ServiceAgentDto } from '../../../models/ServiceAgentDto';
import { getPermissionErrorMessage } from '../../../utils/apiClient';

/**
 * Service-Provider-facing "My Agents" management screen.
 *
 * <p>Closes one half of the Service Agent refinement work — the SP can now
 * see the list of agents in their organisation and deactivate those who
 * are no longer employed, cascade-revoking any open delegations they hold.
 *
 * <p>Service Provider id is read from a URL query parameter for now
 * (e.g. {@code /broker/my-agents?spId=42}) until explicit SP-to-user
 * mapping is added to the auth layer.
 */
export function MyAgents() {
  const [agents, setAgents] = useState<ServiceAgentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [spIdInput, setSpIdInput] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('spId') || '';
  });
  const [spId, setSpId] = useState<number | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('spId');
    return raw ? Number(raw) : null;
  });

  const [confirmTarget, setConfirmTarget] = useState<ServiceAgentDto | null>(null);
  const [reason, setReason] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const loadAgents = async (id: number) => {
    setLoading(true);
    try {
      const list = await serviceProviderAgentsService.listAgents(id);
      setAgents(list);
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      toast.error(permissionError || 'Failed to load agents.');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spId != null) {
      loadAgents(spId);
    } else {
      setLoading(false);
    }
  }, [spId]);

  const onApplySpId = () => {
    const parsed = Number(spIdInput);
    if (!parsed || Number.isNaN(parsed)) {
      toast.warn('Enter a numeric Service Provider id.');
      return;
    }
    setSpId(parsed);
  };

  const onConfirmDeactivate = async () => {
    if (!confirmTarget) return;
    setDeactivating(true);
    try {
      const resp = await serviceProviderAgentsService.deactivateAgent(confirmTarget.id, reason);
      toast.success(`Deactivated ${confirmTarget.fullName || confirmTarget.agentCode}. ${resp.revokedDelegations} delegation(s) revoked.`);
      setConfirmTarget(null);
      setReason('');
      if (spId != null) await loadAgents(spId);
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      toast.error(permissionError || 'Failed to deactivate agent.');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="my-agents">
      <PostLoginHeader />
      <div style={{ maxWidth: 1100, margin: '16px auto', padding: '0 16px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>My Service Agents</h2>

        <Form className="d-flex align-items-end gap-2 mb-3" onSubmit={(e) => { e.preventDefault(); onApplySpId(); }}>
          <Form.Group style={{ flex: '0 0 240px' }}>
            <Form.Label style={{ fontSize: '0.85rem' }}>Service Provider id</Form.Label>
            <Form.Control
              type="number"
              size="sm"
              value={spIdInput}
              onChange={(e) => setSpIdInput(e.target.value)}
              placeholder="e.g. 42"
            />
          </Form.Group>
          <Button type="submit" variant="primary" size="sm">Load</Button>
        </Form>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : spId == null ? (
          <p className="text-muted">Enter a Service Provider id above to view agents.</p>
        ) : agents.length === 0 ? (
          <p className="text-muted">No agents found for this Service Provider.</p>
        ) : (
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Agent Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Region</th>
                <th>Segment</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id}>
                  <td>{a.agentCode}</td>
                  <td>{a.fullName || '—'}</td>
                  <td>{a.email || '—'}</td>
                  <td>{a.mobile || '—'}</td>
                  <td>{a.assignedRegion || '—'}</td>
                  <td>{a.assignedSegment || '—'}</td>
                  <td>
                    {a.isActive
                      ? <Badge bg="success">Active</Badge>
                      : <Badge bg="secondary">Inactive</Badge>}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={!a.isActive}
                      onClick={() => { setConfirmTarget(a); setReason(''); }}
                    >
                      Deactivate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={!!confirmTarget} onHide={() => setConfirmTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Deactivate Service Agent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to deactivate <b>{confirmTarget?.fullName || confirmTarget?.agentCode}</b>.
            All their active and pending delegations will be revoked, and the
            affected investors will be notified by email.
          </p>
          <Form.Group>
            <Form.Label style={{ fontSize: '0.85rem' }}>Reason (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Agent resigned / no longer employed"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setConfirmTarget(null)} disabled={deactivating}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirmDeactivate} disabled={deactivating}>
            {deactivating ? (<><Spinner as="span" animation="border" size="sm" /> Deactivating…</>) : 'Deactivate'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MyAgents;
