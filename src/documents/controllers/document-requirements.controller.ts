import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DocumentRequirementsService } from '../services/document-requirements.service';
import { UpdateDocumentRequirementsDto } from '../dto/update-document-requirements.dto';
import { DocumentRequirementsResponseDto } from '../dto/document-requirements-response.dto';

@ApiTags('Document Requirements')
@Controller('v1/onboarding/document-requirements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentRequirementsController {
  constructor(
    private readonly documentRequirementsService: DocumentRequirementsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get document requirements configuration',
    description:
      'Get the current configuration for required document counts per category during onboarding',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document requirements retrieved successfully',
    type: DocumentRequirementsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Configuration not found',
  })
  async getRequirements(): Promise<DocumentRequirementsResponseDto> {
    return this.documentRequirementsService.getRequirements();
  }

  @Put()
  @Roles('admin', 'hr')
  @ApiOperation({
    summary: 'Update document requirements configuration (admin/HR only)',
    description:
      'Update the required document counts per category for onboarding. Only accessible by admin and HR roles.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document requirements updated successfully',
    type: DocumentRequirementsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async updateRequirements(
    @Body() dto: UpdateDocumentRequirementsDto,
    @Request() req: any,
  ): Promise<DocumentRequirementsResponseDto> {
    const userId = req.user.sub;
    return this.documentRequirementsService.updateRequirements(dto, userId);
  }
}
