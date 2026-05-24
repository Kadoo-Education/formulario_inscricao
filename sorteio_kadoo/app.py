from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Static, Button, ListView, ListItem, Label
from textual.containers import Container, Horizontal, Vertical
from participant_manager import ParticipantManager

class SorteioApp(App):
    CSS = """
    Screen {
        layout: horizontal;
    }
    #sidebar {
        width: 30%;
        border-left: vline white;
        padding: 1;
    }
    #main {
        width: 70%;
        align: center middle;
    }
    .winner-box {
        border: heavy green;
        padding: 1 2;
        margin: 1;
        text-align: center;
        width: 80%;
    }
    .hidden {
        display: none;
    }
    """

    def compose(self) -> ComposeResult:
        yield Header()
        with Container(id="main"):
            yield Label("Pressione o botão para sortear", id="status")
            yield Vertical(id="winner-display")
            yield Button("SORTEAR", variant="primary", id="btn-draw")
            with Horizontal(id="actions", classes="hidden"):
                yield Button("PRESENTE", variant="success", id="btn-confirm")
                yield Button("AUSENTE", variant="error", id="btn-absent")
        with Vertical(id="sidebar"):
            yield Label("GANHADORES")
            yield ListView(id="winners-list")
        yield Footer()

if __name__ == "__main__":
    app = SorteioApp()
    app.run()
