import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { OtpSchema } from 'src/models/otp.model';
import { OtpRepository } from 'src/repositories/otp.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Otp', schema: OtpSchema }]),
    AuthModule,
  ],
  providers: [OtpRepository],
  exports: [MongooseModule],
})
export class OtpModule {}
