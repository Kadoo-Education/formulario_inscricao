import random
import asyncio
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Static, Button, ListView, ListItem, Label
from textual.containers import Container, Horizontal, Vertical
from textual import work
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

    BINDINGS = [("f10", "save_and_quit", "Salvar e Sair")]

    def on_mount(self):
        self.manager = ParticipantManager("sorteio_equipes.csv")
        self.current_candidate = None

    def action_save_and_quit(self):
        filename = self.manager.save_report()
        self.notify(f"Relatório salvo em {filename}")
        self.exit()

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

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-confirm":
            self.manager.confirm_winner(self.current_candidate)
            self.query_one("#winners-list").append(
                ListItem(Label(f"{self.current_candidate['full_name']} ({self.current_candidate['time']})"))
            )
            self.reset_ui()
        elif event.button.id == "btn-absent":
            self.manager.remove_absent(self.current_candidate)
            self.reset_ui()
        elif event.button.id == "btn-draw":
            self.action_draw()

    def reset_ui(self):
        self.current_candidate = None
        self.query_one("#winner-display").update(Label(""))
        self.query_one("#actions").add_class("hidden")

    @work(exclusive=True)
    async def action_draw(self):
        if not self.manager.available:
            self.query_one("#status").update("Nenhum participante disponível!")
            return

        btn = self.query_one("#btn-draw")
        btn.disabled = True
        self.query_one("#actions").add_class("hidden")
        
        # Efeito visual
        for _ in range(15):
            temp_pick = random.choice(self.manager.available)
            self.query_one("#winner-display").update(
                Label(f"[bold]{temp_pick['full_name']}[/]\n{temp_pick['time']}")
            )
            await asyncio.sleep(0.05)
            
        self.current_candidate = self.manager.pick_winner()
        if self.current_candidate:
            self.query_one("#winner-display").update(
                Static(f"[bold red]{self.current_candidate['full_name']}[/]\n{self.current_candidate['time']}", classes="winner-box")
            )
            self.query_one("#actions").remove_class("hidden")
        btn.disabled = False

if __name__ == "__main__":
    app = SorteioApp()
    app.run()
