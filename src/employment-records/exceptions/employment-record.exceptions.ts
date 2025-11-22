import { HttpException, HttpStatus } from '@nestjs/common';

export class EmploymentRecordNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Employment record with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class EmploymentRecordConflictException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class EmploymentRecordValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class EmploymentRecordStatusTransitionException extends HttpException {
  constructor(currentStatus: string, newStatus: string) {
    super(`Invalid status transition from ${currentStatus} to ${newStatus}`, HttpStatus.BAD_REQUEST);
  }
}

export class EmploymentRecordDateValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class EmploymentRecordOverlapException extends HttpException {
  constructor(userId: string, clientId: string) {
    super(`User ${userId} already has an active employment with client ${clientId}`, HttpStatus.CONFLICT);
  }
}

export class EmploymentRecordTerminationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
