import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { InspectionsModule } from './inspections/inspections.module';
import { EvidenceModule } from './evidences/evidence.module';
import { CrewsModule } from './crews/crews.module';
import { MaintenancePlansModule } from './maintenance-plans/maintenance-plans.module';
import { TechniciansModule } from './technicians/technicians.module';
import { ReportsModule } from './reports/reports.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { JwtAuthGuard, RolesGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkOrdersModule,
    InspectionsModule,
    EvidenceModule,
    CrewsModule,
    MaintenancePlansModule,
    TechniciansModule,
    ReportsModule,
    IntegrationsModule,
  ],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: RolesGuard },
  ],
})
export class AppModule {}
