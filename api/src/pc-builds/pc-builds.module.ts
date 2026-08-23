import { Module } from "@nestjs/common";
import { PcBuildsController } from "./pc-builds.controller";

@Module({
  controllers: [PcBuildsController],
})
export class PcBuildsModule {}
