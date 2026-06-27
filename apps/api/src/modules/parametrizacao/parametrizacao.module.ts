import { Module } from "@nestjs/common";
import { ParametrizacaoController } from "./parametrizacao.controller";
import { ParametrizacaoService } from "./parametrizacao.service";
import { ParametrizacaoRepository } from "./parametrizacao.repository";

@Module({
  controllers: [ParametrizacaoController],
  providers: [ParametrizacaoService, ParametrizacaoRepository],
  exports: [ParametrizacaoService],
})
export class ParametrizacaoModule {}
