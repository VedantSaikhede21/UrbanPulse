triage_graph = None
verification_graph = None
TicketState = None


def load_graphs():
    global triage_graph, verification_graph, TicketState
    from app.agents.graph import triage_graph as tg, verification_graph as vg, TicketState as TS
    triage_graph = tg
    verification_graph = vg
    TicketState = TS