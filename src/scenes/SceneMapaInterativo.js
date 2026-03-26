export default class SceneMapaInterativo extends Phaser.Scene {
	constructor() {
		super({ key: "SceneMapainterativo" });
	}

	create() {
		const { width, height } = this.cameras.main;

		this.add.rectangle(0, 0, width, height, 0x0b1020).setOrigin(0, 0);
		this.add
			.text(width / 2, height / 2 - 20, "Mapa Interativo", {
				fontSize: "54px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		this.add
			.text(width / 2, height / 2 + 40, "Pressione ESC para voltar", {
				fontSize: "24px",
				color: "#d6e4ff",
			})
			.setOrigin(0.5);

		this.input.keyboard?.once("keydown-ESC", () => {
			const retornoX = Number(this.registry.get("cidadeRetornoX"));
			const retornoY = Number(this.registry.get("cidadeRetornoY"));

			const dadosRetorno = {};
			if (Number.isFinite(retornoX)) dadosRetorno.spawnX = retornoX;
			if (Number.isFinite(retornoY)) dadosRetorno.spawnY = retornoY;

			this.scene.start("SceneCidade", dadosRetorno);
		});
	}
}
