import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { QueryEvidenceDto } from './dto/query-evidence.dto';
import { multerOptions } from '../common/multer/multer.config';

@ApiTags('Evidences')
@Controller('evidences')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  create(@Body() dto: CreateEvidenceDto) {
    return this.evidenceService.create(dto);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Archivo de evidencia (JPEG, PNG, PDF)' },
        workOrderId: { type: 'string', format: 'uuid' },
        inspectionId: { type: 'string', format: 'uuid', nullable: true },
        observation: { type: 'string', nullable: true },
        registeredById: { type: 'string', format: 'uuid' },
      },
      required: ['file', 'workOrderId', 'registeredById'],
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { workOrderId: string; inspectionId?: string; observation?: string; registeredById: string },
  ) {
    return this.evidenceService.create({
      workOrderId: body.workOrderId,
      inspectionId: body.inspectionId || undefined,
      filePath: file.filename,
      mimeType: file.mimetype,
      originalName: file.originalname,
      observation: body.observation,
      registeredById: body.registeredById,
    });
  }

  @Get()
  findAll(@Query() query: QueryEvidenceDto) {
    return this.evidenceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.evidenceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEvidenceDto) {
    return this.evidenceService.update(id, dto);
  }
}
